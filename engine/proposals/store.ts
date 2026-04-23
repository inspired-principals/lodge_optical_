import { db } from "../memory-store.ts";
import type { Proposal, ProposalStatus } from "./schema.ts";
import { emit } from "../events/bus.ts";

const insertProposal = db.prepare(`
  INSERT INTO proposals (
    id,
    timestamp,
    type,
    target_path,
    before_content,
    after_content,
    diff,
    status,
    author
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const selectProposals = db.prepare(`
  SELECT
    id,
    timestamp,
    type,
    target_path,
    before_content,
    after_content,
    diff,
    status,
    author
  FROM proposals
  ORDER BY timestamp DESC
`);

const updateStatusStatement = db.prepare(`
  UPDATE proposals
  SET status = ?
  WHERE id = ?
`);

export function saveProposal(proposal: Proposal) {
  insertProposal.run(
    proposal.id,
    proposal.timestamp,
    proposal.type,
    proposal.targetPath,
    proposal.before,
    proposal.after,
    proposal.diff,
    proposal.status,
    proposal.author,
  );

  emit({
    type: "proposal_update",
    payload: proposal,
  });
}

export function getProposals(): Proposal[] {
  const rows = selectProposals.all() as Array<{
    id: string;
    timestamp: number;
    type: Proposal["type"];
    target_path: string;
    before_content: string;
    after_content: string;
    diff: string;
    status: ProposalStatus;
    author: Proposal["author"];
  }>;

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    targetPath: row.target_path,
    before: row.before_content,
    after: row.after_content,
    diff: row.diff,
    status: row.status,
    author: row.author,
  }));
}

export function updateProposalStatus(id: string, status: ProposalStatus) {
  updateStatusStatement.run(status, id);
  const proposal = getProposals().find((entry) => entry.id === id);
  if (proposal) {
    emit({
      type: "proposal_update",
      payload: proposal,
    });
  }
}
