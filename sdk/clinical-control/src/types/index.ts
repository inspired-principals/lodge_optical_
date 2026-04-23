export type EnvelopeMeta = {
  tenant_id: string;
  request_id: string;
  version: 'v1';
};

export type EnvelopeAudit = {
  trace_id: string;
};

export type ResponseEnvelope<T> = {
  meta: EnvelopeMeta;
  data: T;
  audit: EnvelopeAudit;
};

export type CaseRecord = {
  id: number;
  tenant_id: string;
  patient_id: number;
  patient_name: string;
  patient_email?: string | null;
  patient_phone?: string | null;
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
  ai_risk_level?: string | null;
  ai_confidence?: number | null;
  ai_flags: string[];
  ai_version?: string | null;
  priority_score?: number | null;
  priority_level?: string | null;
  routing_category?: string | null;
  next_action?: string | null;
  recommended_window?: string | null;
  case_status: string;
  row_version: number;
  updated_at?: string | null;
  updated_by?: string | null;
  case_health: {
    status: 'stable' | 'warning' | 'critical';
    flags: string[];
  };
};

export type CaseTimelineEvent = {
  action_type: string;
  performed_by: string;
  previous_value?: string | null;
  new_value?: string | null;
  created_at: string;
};

export type CaseTimeline = {
  submission_id: number;
  current_status: string;
  priority_score?: number | null;
  routing_category?: string | null;
  timeline: CaseTimelineEvent[];
};
