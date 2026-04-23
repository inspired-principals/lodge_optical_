type SystemEvent =
  | { type: "heartbeat"; payload: { timestamp: number } }
  | { type: "execution"; payload: Record<string, unknown> }
  | { type: "agent_score"; payload: Record<string, unknown> }
  | { type: "proposal_update"; payload: Record<string, unknown> };

type Listener = (event: SystemEvent) => void;

const listeners = new Set<Listener>();

export function emit(event: SystemEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
