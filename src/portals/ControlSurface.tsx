import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getAdminTriageCases } from '../services/triageApi';
import type { AdminTriageCase } from '../types/triageSubmission';

export default function ControlSurface() {
  const [cases, setCases] = useState<AdminTriageCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCases = async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextCases = await getAdminTriageCases(100);
      setCases(nextCases);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load triage submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCases();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Admin Visibility</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Digital Triage Intake</h1>
            <p className="mt-2 text-sm text-slate-400">Live case list from FastAPI storage. This is the current system of record for triage submissions.</p>
          </div>
          <button
            onClick={() => void loadCases()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-900/40">
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading triage submissions...</span>
            </div>
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
            No triage submissions have been stored yet.
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((triageCase) => (
              <Link key={triageCase.submission_id} to={`/control/case/${triageCase.submission_id}`} className="block">
              <article className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6 transition hover:border-white/20 hover:bg-slate-900/70">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Case #{triageCase.submission_id}</p>
                    <h2 className="mt-2 text-xl font-bold text-white">{triageCase.patient_name}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {triageCase.patient_email || 'No email provided'}
                      {triageCase.patient_phone ? ` | ${triageCase.patient_phone}` : ''}
                    </p>
                  </div>
                  <div className="text-sm text-slate-400">
                    Submitted {new Date(triageCase.submitted_at).toLocaleString()}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Metric label="Priority" value={triageCase.priority_level || 'Unassigned'} />
                  <Metric label="Priority score" value={triageCase.priority_score !== undefined ? String(triageCase.priority_score) : 'Unassigned'} />
                  <Metric label="Risk level" value={triageCase.risk_level} />
                  <Metric label="Status" value={triageCase.case_status || 'NEW'} />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <Metric label="Route" value={triageCase.routing_category || 'general_optical'} />
                  <Metric label="Next action" value={triageCase.next_action || 'routine_followup'} />
                  <Metric label="Window" value={triageCase.recommended_window || '1-2 weeks'} />
                  <Metric label="Specialty" value={triageCase.recommended_specialty} />
                  <Metric label="Urgency" value={triageCase.urgency_days === 0 ? 'Immediate' : `${triageCase.urgency_days} days`} />
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Symptoms</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {triageCase.symptoms.length > 0 ? triageCase.symptoms.map((symptom) => (
                        <span key={symptom} className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-100">
                          {symptom}
                        </span>
                      )) : (
                        <span className="text-sm text-slate-500">No symptom summary recorded.</span>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">History</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{triageCase.history || 'No additional history recorded.'}</p>
                  </section>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">AI Interpretation</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {triageCase.ai_summary || 'AI interpretation unavailable for this submission.'}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Metric label="AI risk" value={triageCase.ai_risk_level || 'Unavailable'} />
                      <Metric
                        label="AI signal"
                        value={typeof triageCase.ai_confidence === 'number' ? `${Math.round(triageCase.ai_confidence * 100)}%` : 'Unavailable'}
                      />
                    </div>
                    <div className="mt-3 max-w-xs">
                      <Metric label="AI version" value={triageCase.ai_version || 'Unavailable'} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {triageCase.ai_flags.length > 0 ? triageCase.ai_flags.map((flag) => (
                        <span key={flag} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                          {flag}
                        </span>
                      )) : (
                        <span className="text-sm text-slate-500">No AI routing flags recorded.</span>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Submission Notes</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{triageCase.notes || 'No notes recorded.'}</p>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Clinical Notes</h3>
                    {triageCase.clinical_notes.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        {triageCase.clinical_notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-500">No clinical notes recorded.</p>
                    )}
                  </section>
                </div>
              </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
