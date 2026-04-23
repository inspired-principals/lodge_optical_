import Editor from "@monaco-editor/react";
import { FileTerminal, X } from "lucide-react";

import type { ProposalType } from "../../../services/systemControlApi";

type EditorTab = {
  id: string;
  name: string;
  language: "typescript" | "json" | "markdown";
  content: string;
  editable?: boolean;
};

export default function MonacoEditorPanel({
  tabs,
  activeTab,
  onSelectTab,
  onCloseTab,
  onChange,
  commandHint,
  proposalTargetPath,
  onProposalTargetPathChange,
  proposalType,
  onProposalTypeChange,
}: {
  tabs: EditorTab[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onChange: (value: string) => void;
  commandHint: string;
  proposalTargetPath: string;
  onProposalTargetPathChange: (value: string) => void;
  proposalType: ProposalType;
  onProposalTypeChange: (value: ProposalType) => void;
}) {
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="grid h-full min-h-0 grid-rows-[40px_44px_1fr]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0b1020] px-4">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
          <FileTerminal className="h-4 w-4 text-cyan-400" />
          Editor
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{commandHint}</div>
      </div>

      <div className="flex items-end gap-1 overflow-x-auto border-b border-white/10 bg-[#10162b] px-2 pt-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <div
              key={tab.id}
              className={`group flex min-w-[160px] items-center gap-2 rounded-t-xl border border-b-0 px-3 py-2 text-xs ${
                active
                  ? "border-white/10 bg-[#0d1326] text-white"
                  : "border-transparent bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              <button className="flex-1 truncate text-left" onClick={() => onSelectTab(tab.id)}>
                {tab.name}
              </button>
              {tab.id !== "workspace/command.console" && (
                <button
                  onClick={() => onCloseTab(tab.id)}
                  className="opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid min-h-0 grid-rows-[56px_1fr]">
        <div className="flex items-center gap-3 border-b border-white/10 bg-[#0f1528] px-4">
          <select
            value={proposalType}
            onChange={(event) => onProposalTypeChange(event.target.value as ProposalType)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="engine">engine</option>
            <option value="module">module</option>
            <option value="config">config</option>
            <option value="ui">ui</option>
          </select>
          <input
            value={proposalTargetPath}
            onChange={(event) => onProposalTargetPathChange(event.target.value)}
            placeholder="proposal target path"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-200 outline-none"
          />
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 lg:inline-flex">
            {currentTab?.editable ? "Editable" : "Read-only mirror"}
          </span>
        </div>

        <div className="min-h-0">
          <Editor
            theme="vs-dark"
            language={currentTab?.language || "typescript"}
            value={currentTab?.content || ""}
            onChange={(value) => onChange(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: "on",
              padding: { top: 16 },
              readOnly: !currentTab?.editable,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
