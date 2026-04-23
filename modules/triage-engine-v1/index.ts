export function runTriage(input: Record<string, unknown>) {
  return {
    priority: "medium",
    confidence: 0.6,
    recommendation: "Standard scheduling",
    received: input,
  };
}
