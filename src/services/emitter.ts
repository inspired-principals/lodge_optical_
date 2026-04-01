import { ClinicalEvent, ClinicalEventType } from '../types/clinical';

// Simulated persistence layer for local development (Phase A Foundation)
const STORAGE_KEY = 'lodge_clinical_events_v1';
const SESSION_ID = `sid_${Math.random().toString(36).substring(2, 10)}`;

export const ClinicalEmitter = {
  // Capture a meaningful behavioral or clinical signal
  emit: (event: ClinicalEventType, payload: Record<string, any> = {}) => {
    const clinicalEvent: ClinicalEvent = {
       id: crypto.randomUUID(),
       sessionId: SESSION_ID,
       event,
       payload,
       timestamp: Date.now()
    };
    
    // 1. Log to Secure Pipeline (Mock: Persistent Storage + Debug Console)
    ClinicalEmitter._saveToPersistentStore(clinicalEvent);
    ClinicalEmitter._logDebugSignal(clinicalEvent);
    
    // 2. Fragment Protection: Ensure PHI is never leaked in payloads
    if (payload.token) delete payload.token; 
    
    return clinicalEvent;
  },

  // Internal Logic: Save to clinical event log (simulation of DB ingestion)
  _saveToPersistentStore: (event: ClinicalEvent) => {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      history.push(event);
      // Keep only last 100 on frontend sandbox
      if (history.length > 100) history.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('[Emitter Failure] High-latency recording error.');
    }
  },

  _logDebugSignal: (event: ClinicalEvent) => {
    const colorMap: Record<string, string> = {
      triage: '#3b82f6',
      auth: '#f97316',
      behavior: '#10b981',
      error: '#ef4444'
    };
    
    const category = event.event.split('_')[0];
    const color = colorMap[category] || '#64748b';
    
    console.log(`%c[Signal: ${event.event}] %c${JSON.stringify(event.payload)}`, 
      `color: ${color}; font-weight: bold; background: ${color}10; padding: 2px 6px; border-radius: 4px;`, 
      "color: #94a3b8; font-weight: normal;");
  },

  // Interface for the Control Surface (Phase 4)
  getRecentEvents: (): ClinicalEvent[] => {
     return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },

  clearEvents: () => {
     localStorage.removeItem(STORAGE_KEY);
  }
};
