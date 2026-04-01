export interface ClinicalEvent {
  id: string;
  timestamp: string;
  event: string;
  sessionId: string;
  payload: Record<string, any>;
}
