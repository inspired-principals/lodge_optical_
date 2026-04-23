import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SignalBanner } from '../components/SignalBanner';
import {
  addCaseNote,
  getAdminTriageCase,
  getCaseTimeline,
  overrideCasePriority,
  updateCaseStatus,
} from '../services/triageApi';
import type { AdminTriageCase, CaseTimeline } from '../types/triageSubmission';

const REVIEWED_STATUS = 'REVIEWED';
const CONTACTED_STATUS = 'CONTACTED';

export default function CaseDetailSurface() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<AdminTriageCase | null>(null);
  const [timeline, setTimeline] = useState<CaseTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideScore, setOverrideScore] = useState('');
  const [note, setNote] = useState('');

  const submissionId = Number(id);

  const loadCase = async () => {
    if (!submissionId) {
      setError('Invalid case id.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [nextCase, nextTimeline] = await Promise.all([
        getAdminTriageCase(submissionId),
        getCaseTimeline(submissionId),
      ]);
      setCaseData(nextCase);
      setTimeline(nextTimeline);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load case detail.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCase();
  }, [submissionId]);

  const alerts = useMemo(() => {
    if (!caseData) {
      return [];
    }

    const nextAlerts: string[] = [];
    if ((caseData.priority_score ?? 0) > 80 && caseData.case_status === 'NEW') {
      nextAlerts.push('High priority case remains unreviewed.');
    }
    if (caseData.priority_overridden) {
      nextAlerts.push('Priority has been manually overridden.');
    }
    if (caseData.routing_overridden) {
      nextAlerts.push('Routing has been manually overridden.');
    }
    return nextAlerts;
  }, [caseData]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!submissionId) {
      return;
    }

    setIsMutating(true);
    setError('');
    try {
      const nextCase = await updateCaseStatus(submissionId, newStatus);
      setCaseData(nextCase);
      setTimeline(await getCaseTimeline(submissionId));
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to update case status.');
    } finally {
      setIsMutating(false);
    }
  };

  const handlePriorityOverride = async () => {
    if (!submissionId) {
      return;
    }

    const parsedScore = Number(overrideScore);
    if (!Number.isFinite(parsedScore)) {
      setError('Priority override score must be numeric.');
      return;
    }

    setIsMutating(true);
    setError('');
    try {
      const nextCase = await overrideCasePriority(submissionId, parsedScore, overrideReason);
      setCaseData(nextCase);
      setTimeline(await getCaseTimeline(submissionId));
      setOverrideReason('');
      setOverrideScore('');
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to override priority.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleAddNote = async () => {
    if (!submissionId) {
      return;
    }

    setIsMutating(true);
    setError('');
    try {
      const nextTimeline = await addCaseNote(submissionId, note);
      setTimeline(nextTimeline);
      setNote('');
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to add note.');
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-slate-200">Loading...</div>;
  }

  if (!caseData) {
    return (
      <div className="p-6 text-slate-200">
        <div>{error || 'Case not found.'}</div>
        <button onClick={() => navigate('/control')} className="mt-4 rounded-xl border border-white/10 px-4 py-2">
          Back to queue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <button onClick={() => navigate('/control')} className="text-sm text-slate-400 transition hover:text-white">
          Back to queue
        </button>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</div>
        ) : null}

        <SignalBanner alerts={alerts} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-lg font-bold text-white">Overview</h2>
            <p className="text-sm text-slate-300">{caseData.ai_summary}</p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>Priority: {caseData.priority_score ?? 'Unassigned'}</p>
              <p>Status: {caseData.case_status ?? 'NEW'}</p>
              <p>Route: {caseData.routing_category ?? 'general_optical'}</p>
              <p>Action: {caseData.next_action ?? 'routine_followup'}</p>
              <p>Window: {caseData.recommended_window ?? '1-2 weeks'}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Timeline</h2>
            <div className="space-y-3">
              {timeline?.timeline?.map((entry, index) => (
                <div key={`${entry.created_at}-${index}`} className="rounded-xl border border-white/10 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{entry.performed_by}</div>
                  <div className="mt-1 font-medium text-white">{entry.action_type}</div>
                  <div className="mt-1 text-sm text-slate-300">{entry.new_value || 'No value recorded'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-lg font-bold text-white">Actions</h2>

            <button
              onClick={() => void handleStatusUpdate(REVIEWED_STATUS)}
              disabled={isMutating}
              className="w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => void handleStatusUpdate(CONTACTED_STATUS)}
              disabled={isMutating}
              className="w-full rounded-xl bg-green-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              Mark Contacted
            </button>

            <div className="space-y-2">
              <input
                value={overrideScore}
                onChange={(event) => setOverrideScore(event.target.value)}
                placeholder="Priority score"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white"
              />
              <input
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
                placeholder="Override reason"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white"
              />
              <button
                onClick={() => void handlePriorityOverride()}
                disabled={isMutating}
                className="w-full rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
              >
                Override Priority
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add note"
                className="min-h-32 w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white"
              />
              <button
                onClick={() => void handleAddNote()}
                disabled={isMutating}
                className="w-full rounded-xl bg-slate-200 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
