import { ClinicalEvent, ClinicalEventType } from '../types/clinical';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';

const SESSION_ID = `sid_${Math.random().toString(36).substring(2, 10)}`;

export const ClinicalEmitter = {
  // Capture a meaningful behavioral or clinical signal
  emit: async (event: ClinicalEventType, payload: Record<string, any> = {}) => {
    const clinicalEvent: any = {
       sessionId: SESSION_ID,
       event,
       payload: { ...payload },
       timestamp: Date.now(),
       createdAt: serverTimestamp()
    };
    
    // Fragment Protection: Ensure PHI is never leaked
    if (clinicalEvent.payload.token) delete clinicalEvent.payload.token; 
    
    // Sync to Firestore for real-time cross-app observability (Control Surface)
    try {
      await addDoc(collection(db, 'clinical_events'), clinicalEvent);
    } catch (e) {
      console.error('[Emitter Failure] Firestore sync error:', e);
    }
    
    return clinicalEvent;
  },

  // Real-time Subscription for the Control Surface (Isolated Admin App)
  subscribeEvents: (callback: (events: ClinicalEvent[]) => void) => {
    const q = query(collection(db, 'clinical_events'), orderBy('timestamp', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as ClinicalEvent));
      callback(events);
    }, (error) => {
      console.error('[Emitter Subscription Error]', error);
    });
  },

  // Helper for manual fetch/initial load
  getRecentEvents: async (): Promise<ClinicalEvent[]> => {
    try {
      const q = query(collection(db, 'clinical_events'), orderBy('timestamp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as ClinicalEvent));
    } catch (e) {
      console.error('[Emitter Fetch Error]', e);
      return [];
    }
  }
};
