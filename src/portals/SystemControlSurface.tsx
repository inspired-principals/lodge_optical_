import { useEffect, useMemo, useState } from "react";

import IDEWorkspace from "../control/ide/IDEWorkspace";
import {
  createSystemProposal,
  executeSystemIntent,
  getSystemProposals,
  updateSystemProposalStatus,
  type ProposalResponse,
  type ProposalType,
  type SystemExecutionResponse,
} from "../services/systemControlApi";

export default function SystemControlSurface() {
  const [adminToken, setAdminToken] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<SystemExecutionResponse | null>(null);
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [proposalType, setProposalType] = useState<ProposalType>("engine");
  const [proposalTargetPath, setProposalTargetPath] = useState("");
  const [proposalAfter, setProposalAfter] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedToken = window.sessionStorage.getItem("lodge-admin-token");
    if (savedToken) {
      setAdminToken(savedToken);
    }
  }, []);

  useEffect(() => {
    const trimmedToken = adminToken.trim();
    if (!trimmedToken) {
      setProposals([]);
      return;
    }

    let isActive = true;

    const loadProposals = async () => {
      try {
        const nextProposals = await getSystemProposals(trimmedToken);
        if (isActive) {
          setProposals(nextProposals);
        }
      } catch {
        if (isActive) {
          setProposals([]);
        }
      }
    };

    void loadProposals();
    const intervalId = window.setInterval(() => {
      void loadProposals();
    }, 4000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [adminToken]);

  const activeModule = useMemo(() => {
    const result = output?.result;
    if (result && typeof result.activeModule === "string") {
      return result.activeModule;
    }
    return undefined;
  }, [output]);

  const persistToken = (value: string) => {
    setAdminToken(value);
    if (value.trim()) {
      window.sessionStorage.setItem("lodge-admin-token", value.trim());
    }
  };

  const handleExecute = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return;
    }

    const trimmedToken = adminToken.trim();
    if (!trimmedToken) {
      setError("Admin token required.");
      return;
    }

    setIsRunning(true);
    setError("");

    try {
      persistToken(trimmedToken);
      const result = await executeSystemIntent(trimmedInput, trimmedToken);
      setOutput(result);
    } catch (executionError) {
      setError(executionError instanceof Error ? executionError.message : "Failed to execute system command.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateProposal = async () => {
    const trimmedToken = adminToken.trim();
    if (!trimmedToken) {
      setError("Admin token required.");
      return;
    }

    if (!proposalTargetPath.trim() || !proposalAfter.trim()) {
      setError("Proposal target path and proposed content are required.");
      return;
    }

    setIsSubmittingProposal(true);
    setError("");

    try {
      persistToken(trimmedToken);
      const created = await createSystemProposal(
        {
          type: proposalType,
          targetPath: proposalTargetPath.trim(),
          after: proposalAfter,
          author: "admin",
        },
        trimmedToken,
      );

      setProposals((current) => [created, ...current]);
      setProposalAfter("");
    } catch (proposalError) {
      setError(proposalError instanceof Error ? proposalError.message : "Failed to create proposal.");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleProposalStatus = async (id: string, status: "approved" | "rejected") => {
    const trimmedToken = adminToken.trim();
    if (!trimmedToken) {
      setError("Admin token required.");
      return;
    }

    try {
      await updateSystemProposalStatus(id, status, trimmedToken);
      setProposals((current) =>
        current.map((proposal) => (proposal.id === id ? { ...proposal, status } : proposal)),
      );
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Failed to update proposal.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] px-6 py-8 text-slate-100 md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <IDEWorkspace
          adminToken={adminToken}
          onAdminTokenChange={persistToken}
          input={input}
          onInputChange={setInput}
          onExecute={() => void handleExecute()}
          isRunning={isRunning}
          output={output}
          proposalType={proposalType}
          onProposalTypeChange={setProposalType}
          proposalTargetPath={proposalTargetPath}
          onProposalTargetPathChange={setProposalTargetPath}
          proposalAfter={proposalAfter}
          onProposalAfterChange={setProposalAfter}
          onCreateProposal={() => void handleCreateProposal()}
          isSubmittingProposal={isSubmittingProposal}
          proposals={proposals}
          onProposalStatus={(id, status) => void handleProposalStatus(id, status)}
          activeModule={activeModule}
          error={error}
        />
      </div>
    </div>
  );
}
