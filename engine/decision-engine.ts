import type { Intent } from "./intent-parser.ts";

export type Decision = {
  action: "UPDATE_MODULE" | "TOGGLE_FEATURE" | "RUN_TRIAGE" | "NO_OP";
  payload?: Record<string, unknown>;
};

export function decide(intent: Intent): Decision {
  if (intent.feature && typeof intent.value === "boolean") {
    return {
      action: "TOGGLE_FEATURE",
      payload: {
        feature: intent.feature,
        value: intent.value,
      },
    };
  }

  if (intent.module) {
    return {
      action: "UPDATE_MODULE",
      payload: {
        module: intent.module,
      },
    };
  }

  if (intent.goal.toLowerCase().includes("triage")) {
    return {
      action: "RUN_TRIAGE",
      payload: { input: intent.goal },
    };
  }

  return {
    action: "NO_OP",
  };
}
