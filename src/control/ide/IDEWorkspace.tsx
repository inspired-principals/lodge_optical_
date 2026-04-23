import CodeEditorPanel from "./panels/CodeEditorPanel";
import EvolutionGraph from "./panels/EvolutionGraph";
import AgentArena from "./panels/AgentArena";
import ProposalInspector from "./panels/ProposalInspector";
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

export default function IDEWorkspace(props: IDEWorkspaceProps) {
  return (
    <div className="relative grid gap-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem]">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[28%] h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>
      <SystemHeader
        adminToken={props.adminToken}
        onAdminTokenChange={props.onAdminTokenChange}
        activeModule={props.activeModule}
        proposalCount={props.proposals.length}
        error={props.error}
        lastHeartbeat={props.lastHeartbeat}
      />

      <div className="relative grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <CodeEditorPanel
          input={props.input}
          onInputChange={props.onInputChange}
          onExecute={props.onExecute}
          isRunning={props.isRunning}
          output={props.output}
          proposalType={props.proposalType}
          onProposalTypeChange={props.onProposalTypeChange}
          proposalTargetPath={props.proposalTargetPath}
          onProposalTargetPathChange={props.onProposalTargetPathChange}
          proposalAfter={props.proposalAfter}
          onProposalAfterChange={props.onProposalAfterChange}
          onCreateProposal={props.onCreateProposal}
          isSubmittingProposal={props.isSubmittingProposal}
        />
        <EvolutionGraph adminToken={props.adminToken} />
      </div>

      <div className="relative grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AgentArena adminToken={props.adminToken} />
        <ProposalInspector proposals={props.proposals} onProposalStatus={props.onProposalStatus} />
      </div>
    </div>
  );
}
