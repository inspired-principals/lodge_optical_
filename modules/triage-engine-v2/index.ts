export function runTriage(input: Record<string, unknown>) {
  const signal = String(input.input ?? "").toLowerCase();
  const elevated = signal.includes("pain") || signal.includes("sudden") || signal.includes("trauma");

  return {
    priority: elevated ? "high" : "medium",
    confidence: elevated ? 0.85 : 0.75,
    recommendation: elevated ? "Immediate consultation" : "Priority specialist review",
    received: input,
  };
}
