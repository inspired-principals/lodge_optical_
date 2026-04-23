import type { ProposalResponse } from "../../../services/systemControlApi";

export default function ProposalInspector({
  proposals,
  onProposalStatus,
  compact = false,
}: {
  proposals: ProposalResponse[];
  onProposalStatus: (id: string, status: "approved" | "rejected") => void;
  compact?: boolean;
}) {
  return (
    <section
      className={`h-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(2,6,23,0.94))] shadow-[0_18px_60px_rgba(2,6,23,0.3)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Proposal Inspector</p>
          <h2 className="mt-2 text-lg font-black text-white">Review Queue</h2>
        </div>
        <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-100">
          Versioned diffs
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <SummaryChip label="Pending" value={String(proposals.filter((proposal) => proposal.status === "pending").length)} />
        <SummaryChip label="Approved" value={String(proposals.filter((proposal) => proposal.status === "approved").length)} />
        <SummaryChip label="Rejected" value={String(proposals.filter((proposal) => proposal.status === "rejected").length)} />
      </div>

      <div className={`mt-4 space-y-4 overflow-y-auto pr-1 ${compact ? "max-h-[280px]" : "max-h-[420px]"}`}>
        {proposals.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
            No proposals recorded yet.
          </div>
        ) : (
          proposals.map((proposal) => (
            <article key={proposal.id} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{proposal.type}</p>
                  <h3 className="mt-1 text-sm font-bold text-white">{proposal.targetPath}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {proposal.author} | {new Date(proposal.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                    proposal.status === "approved"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                      : proposal.status === "rejected"
                        ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
                        : "border-white/10 text-cyan-100"
                  }`}
                >
                  {proposal.status}
                </span>
              </div>

              <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/50 p-3 text-[11px] leading-5 text-emerald-100">
                {proposal.diff}
              </pre>

              {proposal.status === "pending" ? (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => onProposalStatus(proposal.id, "approved")}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-emerald-400"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onProposalStatus(proposal.id, "rejected")}
                    className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-rose-400"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
