import { Loader2, MessageSquareText, GitPullRequestArrow, Activity, History } from "lucide-react";

import ProposalInspector from "./ProposalInspector";
import EvolutionGraph from "./EvolutionGraph";
import type { ProposalResponse, SystemExecutionResponse } from "../../../services/systemControlApi";

export default function BottomPanel({
  activeTab,
  onSelectTab,
  input,
  onInputChange,
  onExecute,
  isRunning,
  output,
  proposals,
  onProposalStatus,
}: {
  activeTab: "chat" | "proposals" | "execution" | "evolution";
  onSelectTab: (tab: "chat" | "proposals" | "execution" | "evolution") => void;
  input: string;
  onInputChange: (value: string) => void;
  onExecute: () => void;
  isRunning: boolean;
  output: SystemExecutionResponse | null;
  proposals: ProposalResponse[];
  onProposalStatus: (id: string, status: "approved" | "rejected") => void;
}) {
  const tabs = [
    { id: "chat", label: "Chat", icon: MessageSquareText },
    { id: "proposals", label: "Proposals", icon: GitPullRequestArrow },
    { id: "execution", label: "Execution", icon: Activity },
    { id: "evolution", label: "Evolution", icon: History },
  ] as const;

  return (
    <div className="grid h-full min-h-0 grid-rows-[42px_1fr]">
      <div className="flex items-center gap-1 border-b border-white/10 bg-[#0a1020] px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                active ? "bg-white/8 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 overflow-hidden p-3">
        {activeTab === "chat" ? (
          <div className="grid h-full gap-3 md:grid-cols-[1fr_auto]">
            <textarea
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="Talk directly to the system..."
              className="h-full min-h-[120px] rounded-[1.5rem] border border-white/10 bg-black/30 p-4 text-sm text-white outline-none transition focus:border-cyan-400"
            />
            <button
              onClick={onExecute}
              disabled={isRunning}
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Execute
            </button>
          </div>
        ) : null}

        {activeTab === "proposals" ? <ProposalInspector proposals={proposals} onProposalStatus={onProposalStatus} compact /> : null}

        {activeTab === "execution" ? (
          <pre className="h-full overflow-auto rounded-[1.5rem] border border-white/10 bg-black/30 p-4 text-[11px] leading-5 text-cyan-100">
            {output ? JSON.stringify(output, null, 2) : "No execution output yet."}
          </pre>
        ) : null}

        {activeTab === "evolution" ? <EvolutionGraph adminToken="" embedded eventsOnly /> : null}
      </div>
    </div>
  );
}
