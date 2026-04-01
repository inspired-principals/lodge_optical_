import type { ClinicalEvent } from '../types/clinical';

const seedEvents: ClinicalEvent[] = [
  {
    id: 'evt-1001',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    event: 'triage_started',
    sessionId: 'session-a19f',
    payload: { mode: 'manual', segment: 'analyzer' },
  },
  {
    id: 'evt-1002',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    event: 'triage_mode_selected',
    sessionId: 'session-a19f',
    payload: { mode: 'manual', segment: 'analyzer' },
  },
  {
    id: 'evt-1003',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    event: 'triage_completed',
    sessionId: 'session-b27c',
    payload: { mode: 'camera', segment: 'compliant' },
  },
  {
    id: 'evt-1004',
    timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
    event: 'api_error',
    sessionId: 'session-c88z',
    payload: { payload: { type: 'conversion' }, message: 'conversion suppressed due to low confidence', segment: 'skeptic' },
  },
];

const rotatingEvents = [
  { event: 'triage_started', payload: { mode: 'manual', segment: 'distressed' } },
  { event: 'triage_mode_selected', payload: { mode: 'camera', segment: 'compliant' } },
  { event: 'triage_completed', payload: { mode: 'manual', segment: 'analyzer' } },
];

export const ClinicalEmitter = {
  subscribeEvents(callback: (events: ClinicalEvent[]) => void) {
    let events = [...seedEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    callback(events);

    const interval = setInterval(() => {
      const template = rotatingEvents[Math.floor(Math.random() * rotatingEvents.length)];
      const nextEvent: ClinicalEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: template.event,
        sessionId: `session-${Math.random().toString(36).slice(2, 6)}`,
        payload: template.payload,
      };

      events = [nextEvent, ...events].slice(0, 18);
      callback(events);
    }, 5000);

    return () => clearInterval(interval);
  },
};
