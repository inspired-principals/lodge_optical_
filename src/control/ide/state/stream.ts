type Handler = (event: any) => void;

const handlers = new Set<Handler>();
let socket: WebSocket | null = null;
let activeToken = "";

export function connectStream(token: string) {
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    disconnectStream();
    return;
  }

  if (socket && activeToken === trimmedToken && socket.readyState <= WebSocket.OPEN) {
    return;
  }

  disconnectStream();
  activeToken = trimmedToken;

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${window.location.host}/api/system/stream?token=${encodeURIComponent(trimmedToken)}`);

  socket.onmessage = (message) => {
    const event = JSON.parse(message.data);
    for (const handler of handlers) {
      handler(event);
    }
  };

  socket.onclose = () => {
    socket = null;
  };
}

export function disconnectStream() {
  if (socket) {
    socket.close();
    socket = null;
  }
  activeToken = "";
}

export function onEvent(handler: Handler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}
