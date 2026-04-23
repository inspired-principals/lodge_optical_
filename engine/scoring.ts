import type { ModuleExecutionResult } from "./module-runner.ts";

type ScoringConfig = {
  scoring: {
    weights: {
      priority: number;
      confidence: number;
      speed: number;
      outcome: number;
      riskPenalty: number;
    };
    thresholds: {
      minConfidence: number;
      maxResponseTime: number;
    };
  };
};

type ScoredResult = ModuleExecutionResult & {
  score: number;
  breakdown: {
    priority?: number;
    confidence?: number;
    speed?: number;
    outcome?: number;
    riskPenalty?: number;
    error?: boolean;
  };
};

const priorityMap: Record<string, number> = {
  high: 1,
  medium: 0.6,
  low: 0.3,
};

function normalizeSpeed(time: number | undefined, config: ScoringConfig) {
  if (!time) {
    return 0.5;
  }

  const max = config.scoring.thresholds.maxResponseTime;
  return Math.max(0, 1 - time / max);
}

export function scoreResults(results: ModuleExecutionResult[], config: ScoringConfig): ScoredResult[] {
  const weights = config.scoring.weights;

  return results.map((result) => {
    if (!result.success) {
      return {
        ...result,
        score: 0,
        breakdown: { error: true },
      };
    }

    const output = result.output ?? {};
    const confidence = Number(result.output?.confidence ?? 0.5);
    const priority = priorityMap[String(output.priority ?? "low")] ?? 0.3;
    const speed = normalizeSpeed(result.executionTime, config);
    const outcome = Number(output.outcomeScore ?? 0.5);
    let riskPenalty = 0;

    if (confidence < config.scoring.thresholds.minConfidence) {
      riskPenalty += 0.3;
    }

    if (!output.recommendation) {
      riskPenalty += 0.2;
    }

    if (output.priority === "high" && confidence < 0.6) {
      riskPenalty += 0.5;
    }

    const score =
      priority * weights.priority +
      confidence * weights.confidence +
      speed * weights.speed +
      outcome * weights.outcome -
      riskPenalty * weights.riskPenalty;

    return {
      ...result,
      score,
      breakdown: {
        priority,
        confidence,
        speed,
        outcome,
        riskPenalty,
      },
    };
  });
}

export function selectBest(scored: ScoredResult[]) {
  return [...scored].sort((a, b) => b.score - a.score)[0] ?? null;
}
