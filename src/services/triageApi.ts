import type { AdminTriageCase, CaseTimeline, TriageSubmissionRequest } from '../types/triageSubmission';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || detail;
    } catch {
      // Fall back to default message when the response body is not JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function submitTriage(data: TriageSubmissionRequest) {
  return request<AdminTriageCase>('/triage/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getAdminTriageCases(limit = 100) {
  const params = new URLSearchParams({ limit: String(limit) });
  return request<AdminTriageCase[]>(`/admin/triage?${params.toString()}`);
}

export function getAdminTriageCase(submissionId: number | string) {
  return request<AdminTriageCase>(`/admin/triage/${submissionId}`);
}

export function getCaseTimeline(submissionId: number | string) {
  return request<CaseTimeline>(`/admin/triage/${submissionId}/timeline`);
}

export function updateCaseStatus(submissionId: number | string, newStatus: string, userId = 'staff_console') {
  return request<AdminTriageCase>(`/admin/triage/${submissionId}/status`, {
    method: 'POST',
    body: JSON.stringify({ new_status: newStatus, user_id: userId }),
  });
}

export function overrideCasePriority(
  submissionId: number | string,
  newScore: number,
  reason: string,
  userId = 'staff_console',
) {
  return request<AdminTriageCase>(`/admin/triage/${submissionId}/override-priority`, {
    method: 'POST',
    body: JSON.stringify({ new_score: newScore, reason, user_id: userId }),
  });
}

export function addCaseNote(submissionId: number | string, note: string, userId = 'staff_console') {
  return request<CaseTimeline>(`/admin/triage/${submissionId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note, user_id: userId }),
  });
}
