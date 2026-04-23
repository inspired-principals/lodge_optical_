import { Loader2, TerminalSquare } from "lucide-react";

import type { ProposalType, SystemExecutionResponse } from "../../../services/systemControlApi";

type CodeEditorPanelProps = {
  input: string;
  onInputChange: (value: string) => void;
  onExecute: () => void;
  isRunning: boolean;
  output: SystemExecutionResponse | null;
  proposalType: ProposalType;
  onProposalTypeChange: (value: ProposalType) => void;
  proposalTargetPath: string;
  onProposalTargetPathChange: (value: string) => void;
  proposalAfter: string;
  onProposalAfterChange: (value: string) => void;
  onCreateProposal: () => void;
  isSubmittingProposal: boolean;
};

export default function CodeEditorPanel(props: CodeEditorPanelProps) {
  return (
    <section className="grid h-full gap-5 rounded-[2rem] border border-white/10 bg-slate-900/50 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-300">
            <TerminalSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Code Surface</p>
            <h2 className="mt-1 text-lg font-black text-white">Operator Console</h2>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 md:flex">
          Runtime command lane
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.75),rgba(2,6,23,0.92))] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Command Console</p>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
              Live execution
            </span>
          </div>
          <textarea
            value={props.input}
            onChange={(event) => props.onInputChange(event.target.value)}
            placeholder="triage patient with sudden pain"
            className="mt-4 min-h-[220px] w-full rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-sm text-white outline-none transition focus:border-cyan-400"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={props.onExecute}
              disabled={props.isRunning}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70"
            >
              {props.isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Execute
            </button>
            <span className="text-xs text-slate-500">Commands mutate state, never source files.</span>
          </div>

          <pre className="mt-4 max-h-[260px] overflow-auto rounded-2xl border border-white/10 bg-black/50 p-3 text-[11px] leading-5 text-cyan-100">
            {props.output ? JSON.stringify(props.output, null, 2) : "Awaiting system execution..."}
          </pre>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.95))] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Proposal Composer</p>
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
              Review before deploy
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-[0.34fr_0.66fr]">
              <select
                value={props.proposalType}
                onChange={(event) => props.onProposalTypeChange(event.target.value as ProposalType)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white outline-none transition focus:border-indigo-400"
              >
                <option value="engine">engine</option>
                <option value="module">module</option>
                <option value="config">config</option>
                <option value="ui">ui</option>
              </select>
              <input
                value={props.proposalTargetPath}
                onChange={(event) => props.onProposalTargetPathChange(event.target.value)}
                placeholder="engine/scoring.ts"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white outline-none transition focus:border-indigo-400"
              />
            </div>
            <textarea
              value={props.proposalAfter}
              onChange={(event) => props.onProposalAfterChange(event.target.value)}
              placeholder="Proposed full file content"
              className="min-h-[320px] w-full rounded-2xl border border-white/10 bg-slate-950/85 p-4 font-mono text-sm text-emerald-100 outline-none transition focus:border-indigo-400"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={props.onCreateProposal}
                disabled={props.isSubmittingProposal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-indigo-400 disabled:opacity-70"
              >
                {props.isSubmittingProposal ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create Proposal
              </button>
              <span className="text-xs text-slate-500">Stored as a versioned diff, not applied to runtime.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
