import { ClinicalClientCore } from '../client';
import type { CaseRecord, CaseTimeline, ResponseEnvelope } from '../types';

export class CasesClient {
  constructor(private readonly client: ClinicalClientCore) {}

  list() {
    return this.client.request<ResponseEnvelope<CaseRecord[]>>('/cases');
  }

  get(id: string | number) {
    return this.client.request<ResponseEnvelope<CaseRecord>>(`/cases/${id}`);
  }

  updateStatus(id: string | number, status: string, rowVersion: number) {
    return this.client.request<ResponseEnvelope<CaseRecord>>(`/cases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ new_status: status, row_version: rowVersion }),
    });
  }

  overridePriority(id: string | number, score: number, reason: string, rowVersion: number) {
    return this.client.request<ResponseEnvelope<CaseRecord>>(`/cases/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ new_score: score, reason, row_version: rowVersion }),
    });
  }

  overrideRouting(id: string | number, category: string, reason: string, rowVersion: number) {
    return this.client.request<ResponseEnvelope<CaseRecord>>(`/cases/${id}/routing`, {
      method: 'PATCH',
      body: JSON.stringify({ new_category: category, reason, row_version: rowVersion }),
    });
  }

  addNote(id: string | number, note: string) {
    return this.client.request<ResponseEnvelope<CaseTimeline>>(`/cases/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  timeline(id: string | number) {
    return this.client.request<ResponseEnvelope<CaseTimeline>>(`/cases/${id}/timeline`);
  }
}
