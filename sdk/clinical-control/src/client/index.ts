export type ClinicalClientOptions = {
  apiKey: string;
  tenantId: string;
  baseUrl: string;
};

export class ClinicalClientCore {
  constructor(private readonly options: ClinicalClientOptions) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.options.baseUrl}/api/v1/clinical-control${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': this.options.tenantId,
        Authorization: `Bearer ${this.options.apiKey}`,
        ...(init?.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Clinical Control request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}
