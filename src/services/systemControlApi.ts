export type SystemExecutionResponse = {
  intent: Record<string, unknown>;
  decision: {
    action: string;
    payload?: Record<string, unknown>;
  };
  result: Record<string, unknown>;
  memory: unknown[];
};

export type ProposalStatus = "pending" | "approved" | "rejected" | "deployed";
export type ProposalType = "module" | "config" | "ui" | "engine";

export type ProposalResponse = {
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

export type EvolutionEvent = {
  id: string;
  type: "proposal" | "commit" | "execution";
  timestamp: number;
  label: string;
  score?: number;
  parent?: string;
};

export type AgentArenaEntry = {
  name: string;
  score: number;
  wins: number;
  uses: number;
  avgExecutionTime: number;
  isLeader: boolean;
};

type RequestOptions = RequestInit & {
  adminToken?: string;
};

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.adminToken ? { "x-admin-token": init.adminToken } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || detail;
    } catch {
      // Keep default message when the body is not JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function executeSystemIntent(input: string, adminToken: string) {
  return request<SystemExecutionResponse>("/api/system/execute", {
    method: "POST",
    body: JSON.stringify({ input }),
    adminToken,
  });
}

export function getSystemProposals(adminToken: string) {
  return request<ProposalResponse[]>("/api/system/proposals", {
    method: "GET",
    adminToken,
  });
}

export function createSystemProposal(
  payload: {
    type: ProposalType;
    targetPath: string;
    after: string;
    author?: "admin" | "agent";
  },
  adminToken: string,
) {
  return request<ProposalResponse>("/api/system/proposals", {
    method: "POST",
    body: JSON.stringify(payload),
    adminToken,
  });
}

export function updateSystemProposalStatus(id: string, status: ProposalStatus, adminToken: string) {
  return request<{ ok: true }>("/api/system/proposals/update", {
    method: "POST",
    body: JSON.stringify({ id, status }),
    adminToken,
  });
}

export function getSystemEvolution(adminToken: string) {
  return request<EvolutionEvent[]>("/api/system/evolution", {
    method: "GET",
    adminToken,
  });
}

export function getSystemAgentArena(adminToken: string) {
  return request<AgentArenaEntry[]>("/api/system/agent-arena", {
    method: "GET",
    adminToken,
  });
}
