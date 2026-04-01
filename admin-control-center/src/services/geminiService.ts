const cannedResponses = [
  'Demo mode is active. The admin assistant is ready for project questions.',
  'Current status looks stable. No critical alerts are present in the control center.',
  'You can connect a live Gemini key later with `VITE_GEMINI_API_KEY` if needed.',
];

export async function sendMessage(message: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const reply = cannedResponses[Math.floor(Math.random() * cannedResponses.length)];
  return `${reply}\n\nPrompt received: "${message.trim()}"`;
}
