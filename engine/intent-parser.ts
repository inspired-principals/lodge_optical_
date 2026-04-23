export type Intent = {
  goal: string;
  target?: string;
  constraints?: string[];
  feature?: string;
  value?: boolean;
  module?: string;
};

export function parseIntent(input: string): Intent {
  const normalized = input.trim();
  const lowered = normalized.toLowerCase();

  const toggleMatch = lowered.match(/(enable|disable|turn on|turn off)\s+([a-z0-9_-]+)/i);
  if (toggleMatch) {
    const enableCommand = ["enable", "turn on"].includes(toggleMatch[1]);
    return {
      goal: normalized,
      target: "system",
      constraints: [],
      feature: toggleMatch[2],
      value: enableCommand,
    };
  }

  const moduleMatch = lowered.match(/(activate|update|switch)\s+(?:module\s+)?([a-z0-9_-]+)/i);
  if (moduleMatch) {
    return {
      goal: normalized,
      target: "system",
      constraints: [],
      module: moduleMatch[2],
    };
  }

  return {
    goal: normalized,
    target: "system",
    constraints: [],
  };
}
