import { ClinicalEvent, ClinicalEventType } from '../types/clinical';

const SESSION_ID = `sid_${Math.random().toString(36).substring(2, 10)}`;

export const ClinicalEmitter = {
  emit: async (event: ClinicalEventType, payload: Record<string, any> = {}) => {
    const sanitizedPayload = { ...payload };
    if (sanitizedPayload.token) {
      delete sanitizedPayload.token;
    }

    const clinicalEvent: ClinicalEvent = {
      id: crypto.randomUUID(),
      sessionId: SESSION_ID,
      event,
      payload: sanitizedPayload,
      timestamp: Date.now(),
    };

    if (import.meta.env.DEV) {
      console.log('[ClinicalEmitter]', clinicalEvent);
    }

    return clinicalEvent;
  },

  subscribeEvents: (callback: (events: ClinicalEvent[]) => void) => {
    callback([]);
    return () => undefined;
  },

  getRecentEvents: async (): Promise<ClinicalEvent[]> => [],
};
