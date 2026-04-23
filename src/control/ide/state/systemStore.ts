type SystemState = {
  lastHeartbeat: number | null;
  executions: any[];
  proposals: Record<string, any>;
  agents: Record<string, any>;
};

const state: SystemState = {
  lastHeartbeat: null,
  executions: [],
  proposals: {},
  agents: {},
};

type StateListener = (nextState: SystemState) => void;

const listeners = new Set<StateListener>();

function notify() {
  const snapshot = getState();
  for (const listener of listeners) {
    listener(snapshot);
  }
}

export function updateSystemState(event: any) {
  if (event.type === "heartbeat") {
    state.lastHeartbeat = Number(event.payload?.timestamp ?? Date.now());
  }

  if (event.type === "execution") {
    state.executions = [event.payload, ...state.executions].slice(0, 40);
  }

  if (event.type === "proposal_update") {
    const proposal = event.payload;
    if (proposal?.id) {
      state.proposals[String(proposal.id)] = proposal;
    }
  }

  if (event.type === "agent_score") {
    const agent = event.payload;
    if (agent?.module) {
      state.agents[String(agent.module)] = agent;
    }
  }

  notify();
}

export function getState(): SystemState {
  return {
    lastHeartbeat: state.lastHeartbeat,
    executions: [...state.executions],
    proposals: { ...state.proposals },
    agents: { ...state.agents },
  };
}

export function subscribeSystemState(listener: StateListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
