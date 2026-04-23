export type ProposalStatus = "pending" | "approved" | "rejected" | "deployed";

export type ProposalType = "module" | "config" | "ui" | "engine";

export type Proposal = {
  id: string;
  timestamp: number;
  type: ProposalType;
  targetPath: string;
  before: string;
  after: string;
  diff: string;
  status: ProposalStatus;
  author: "admin" | "agent";
};
