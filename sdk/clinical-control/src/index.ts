import { CasesClient } from './cases';
import { ClinicalClientCore, type ClinicalClientOptions } from './client';
export * from './types';

export class ClinicalClient {
  readonly cases: CasesClient;

  constructor(options: ClinicalClientOptions) {
    const core = new ClinicalClientCore(options);
    this.cases = new CasesClient(core);
  }
}
