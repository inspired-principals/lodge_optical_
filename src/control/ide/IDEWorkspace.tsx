import { useEffect, useMemo, useState } from "react";

import BottomPanel from "./panels/BottomPanel";
import FileTreePanel, { type WorkspaceFileNode } from "./panels/FileTreePanel";
import MonacoEditorPanel from "./panels/MonacoEditorPanel";
import RightSidebar from "./panels/RightSidebar";
import SystemHeader from "./panels/SystemHeader";
import type { ProposalResponse, ProposalType, SystemExecutionResponse } from "../../services/systemControlApi";

type IDEWorkspaceProps = {
  adminToken: string;
  onAdminTokenChange: (value: string) => void;
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
  proposals: ProposalResponse[];
  onProposalStatus: (id: string, status: "approved" | "rejected") => void;
  activeModule?: string;
  error: string;
  lastHeartbeat: number | null;
};

type OpenFile = {
  id: string;
  name: string;
  language: "typescript" | "json" | "markdown";
  content: string;
  editable?: boolean;
};

function buildWorkspaceTree(proposals: ProposalResponse[]): WorkspaceFileNode[] {
  const proposalNodes = proposals.slice(0, 6).map((proposal) => ({
    id: `proposal:${proposal.id}`,
    name: proposal.targetPath.split("/").pop() || proposal.targetPath,
    path: `proposal:${proposal.id}`,
    type: "file" as const,
  }));

  return [
    {
      id: "workspace",
      name: "workspace",
      type: "folder",
      children: [
        { id: "command", name: "command.console", path: "workspace/command.console", type: "file" },
        { id: "proposal-draft", name: "proposal.draft", path: "workspace/proposal.draft", type: "file" },
        { id: "execution", name: "execution.output", path: "workspace/execution.output", type: "file" },
      ],
    },
    {
      id: "engine",
      name: "engine",
      type: "folder",
      children: [
        { id: "engine/scoring", name: "scoring.ts", path: "engine/scoring.ts", type: "file" },
        { id: "engine/action-runner", name: "action-runner.ts", path: "engine/action-runner.ts", type: "file" },
        { id: "engine/intent-parser", name: "intent-parser.ts", path: "engine/intent-parser.ts", type: "file" },
      ],
    },
    {
      id: "modules",
      name: "modules",
      type: "folder",
      children: [
        { id: "modules/v1", name: "triage-engine-v1.ts", path: "modules/triage-engine-v1/index.ts", type: "file" },
        { id: "modules/v2", name: "triage-engine-v2.ts", path: "modules/triage-engine-v2/index.ts", type: "file" },
      ],
    },
    {
      id: "config",
      name: "config",
      type: "folder",
      children: [
        { id: "config/system", name: "system.json", path: "config/system.json", type: "file" },
        { id: "config/backups", name: "backups.json", path: "config/backups.json", type: "file" },
      ],
    },
    {
      id: "proposals",
      name: "proposals",
      type: "folder",
      children: proposalNodes,
    },
  ];
}

export default function IDEWorkspace(props: IDEWorkspaceProps) {
  const workspaceTree = useMemo(() => buildWorkspaceTree(props.proposals), [props.proposals]);

  const fileCatalog = useMemo<Record<string, OpenFile>>(
    () => ({
      "workspace/command.console": {
        id: "workspace/command.console",
        name: "command.console",
        language: "markdown",
        content: props.input || "# Command Console\n\nEnter an operator command to execute against the live system.",
        editable: true,
      },
      "workspace/proposal.draft": {
        id: "workspace/proposal.draft",
        name: "proposal.draft",
        language: "typescript",
        content: props.proposalAfter || "// Compose a proposal here, then send it to the review queue.",
        editable: true,
      },
      "workspace/execution.output": {
        id: "workspace/execution.output",
        name: "execution.output",
        language: "json",
        content: props.output ? JSON.stringify(props.output, null, 2) : '{\n  "status": "idle"\n}',
      },
      "engine/scoring.ts": {
        id: "engine/scoring.ts",
        name: "scoring.ts",
        language: "typescript",
        content: `// Multi-objective scoring model\n// Active module: ${props.activeModule || "unknown"}\n\nexport const weights = ${JSON.stringify(
          props.output?.result && typeof props.output.result === "object" ? (props.output.result as Record<string, unknown>).strategy ?? "multiObjective" : "multiObjective",
          null,
          2,
        )};\n`,
      },
      "engine/action-runner.ts": {
        id: "engine/action-runner.ts",
        name: "action-runner.ts",
        language: "typescript",
        content: `// Runtime action surface\n// Recent execution count: ${props.output?.memory?.length ?? 0}\n\n// Actions are evaluated through the control engine and mirrored into the workspace.`,
      },
      "engine/intent-parser.ts": {
        id: "engine/intent-parser.ts",
        name: "intent-parser.ts",
        language: "typescript",
        content: "// Intent parsing remains rule-driven and constrained.\n// Use the command panel below to drive live executions.",
      },
      "modules/triage-engine-v1/index.ts": {
        id: "modules/triage-engine-v1/index.ts",
        name: "triage-engine-v1.ts",
        language: "typescript",
        content: "// Conservative triage strategy\nexport function runTriage() {\n  return { priority: 'medium', confidence: 0.6 };\n}",
      },
      "modules/triage-engine-v2/index.ts": {
        id: "modules/triage-engine-v2/index.ts",
        name: "triage-engine-v2.ts",
        language: "typescript",
        content: `// Current active strategy hint: ${props.activeModule || "unknown"}\nexport function runTriage() {\n  return { priority: 'high', confidence: 0.85 };\n}`,
      },
      "config/system.json": {
        id: "config/system.json",
        name: "system.json",
        language: "json",
        content: `{\n  "activeModule": "${props.activeModule || "unknown"}",\n  "proposalQueue": ${props.proposals.length}\n}`,
      },
      "config/backups.json": {
        id: "config/backups.json",
        name: "backups.json",
        language: "json",
        content: "{\n  \"status\": \"snapshots-managed-server-side\"\n}",
      },
    }),
    [props.input, props.proposalAfter, props.output, props.activeModule, props.proposals.length],
  );

  const [openTabs, setOpenTabs] = useState<string[]>(["workspace/command.console", "workspace/proposal.draft"]);
  const [activeTab, setActiveTab] = useState<string>("workspace/proposal.draft");
  const [bottomTab, setBottomTab] = useState<"chat" | "proposals" | "execution" | "evolution">("chat");

  useEffect(() => {
    if (props.output) {
      setOpenTabs((current) => (current.includes("workspace/execution.output") ? current : [...current, "workspace/execution.output"]));
    }
  }, [props.output]);

  useEffect(() => {
    if (!openTabs.includes(activeTab)) {
      setActiveTab(openTabs[0] || "workspace/command.console");
    }
  }, [activeTab, openTabs]);

  const activeFile = fileCatalog[activeTab] || fileCatalog["workspace/command.console"];

  const handleOpenFile = (path: string) => {
    setOpenTabs((current) => (current.includes(path) ? current : [...current, path]));
    setActiveTab(path);
  };

  const handleCloseTab = (path: string) => {
    setOpenTabs((current) => {
      const next = current.filter((tab) => tab !== path);
      if (activeTab === path && next.length > 0) {
        setActiveTab(next[next.length - 1]);
      }
      return next.length > 0 ? next : ["workspace/command.console"];
    });
  };

  const handleEditorChange = (value: string) => {
    if (activeTab === "workspace/command.console") {
      props.onInputChange(value);
      return;
    }

    if (activeTab === "workspace/proposal.draft") {
      props.onProposalAfterChange(value);
    }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (activeTab === "workspace/proposal.draft") {
          props.onCreateProposal();
        } else {
          props.onExecute();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [activeTab, props]);

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f1c] shadow-[0_35px_120px_rgba(2,6,23,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_30%),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:auto,auto,28px_28px,28px_28px]" />

      <div className="relative grid h-full grid-rows-[72px_1fr_248px]">
        <div className="border-b border-white/10">
          <SystemHeader
            adminToken={props.adminToken}
            onAdminTokenChange={props.onAdminTokenChange}
            activeModule={props.activeModule}
            proposalCount={props.proposals.length}
            error={props.error}
            lastHeartbeat={props.lastHeartbeat}
          />
        </div>

        <div className="grid min-h-0 grid-cols-[250px_minmax(0,1fr)_320px]">
          <div className="border-r border-white/10 bg-black/20">
            <FileTreePanel tree={workspaceTree} activePath={activeTab} onOpenFile={handleOpenFile} />
          </div>

          <div className="min-w-0 bg-[#0d1326]">
            <MonacoEditorPanel
              tabs={openTabs.map((tab) => fileCatalog[tab]).filter(Boolean)}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onCloseTab={handleCloseTab}
              onChange={handleEditorChange}
              commandHint={activeTab === "workspace/proposal.draft" ? "Ctrl/Cmd + Enter to create proposal" : "Ctrl/Cmd + Enter to execute command"}
              proposalTargetPath={props.proposalTargetPath}
              onProposalTargetPathChange={props.onProposalTargetPathChange}
              proposalType={props.proposalType}
              onProposalTypeChange={props.onProposalTypeChange}
            />
          </div>

          <div className="border-l border-white/10 bg-black/20">
            <RightSidebar adminToken={props.adminToken} activeModule={props.activeModule} lastHeartbeat={props.lastHeartbeat} />
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#0b1020]/95">
          <BottomPanel
            activeTab={bottomTab}
            onSelectTab={setBottomTab}
            input={props.input}
            onInputChange={props.onInputChange}
            onExecute={props.onExecute}
            isRunning={props.isRunning}
            output={props.output}
            proposals={props.proposals}
            onProposalStatus={props.onProposalStatus}
          />
        </div>
      </div>
    </div>
  );
}
