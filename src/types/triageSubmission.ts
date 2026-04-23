export interface TriagePatientPayload {
  full_name: string;
  email?: string;
  phone?: string;
}

export interface TriageSubmissionPayload {
  symptoms: string[];
  history: string;
  severity_score: number;
  notes: string;
  risk_level: string;
  recommended_specialty: string;
  urgency_days: number;
  clinical_notes: string[];
  diagnostic_results: Record<string, unknown>;
}

export interface TriageSubmissionRequest {
  patient: TriagePatientPayload;
  triage: TriageSubmissionPayload;
}

export interface AdminTriageCase {
  submission_id: number;
  patient_id: number;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  submitted_at: string;
  severity_score: number;
  risk_level: string;
  recommended_specialty: string;
  urgency_days: number;
  symptoms: string[];
  history: string;
  notes: string;
  clinical_notes: string[];
  ai_summary: string;
  ai_risk_level?: 'low' | 'moderate' | 'high' | 'urgent' | string;
  ai_confidence?: number;
  ai_flags: string[];
  ai_version?: string;
  priority_score?: number;
  priority_level?: 'low' | 'moderate' | 'high' | 'urgent' | string;
  routing_category?: string;
  next_action?: string;
  recommended_window?: string;
  case_status?: string;
}

export interface CaseTimelineEntry {
  action_type: string;
  performed_by: string;
  previous_value?: string | null;
  new_value?: string | null;
  created_at: string;
}

export interface CaseTimeline {
  submission_id: number;
  current_status: string;
  priority_score?: number;
  routing_category?: string;
  timeline: CaseTimelineEntry[];
}
