import { loadModule } from "./module-loader.ts";

export type ModuleExecutionResult = {
  module: string;
  output?: Record<string, unknown>;
  error?: string;
  success: boolean;
  executionTime?: number;
};

export async function runModules(moduleNames: string[], payload: Record<string, unknown>) {
  const results: ModuleExecutionResult[] = [];

  for (const name of moduleNames) {
    const mod = await loadModule(name);

    if (!mod || typeof mod.runTriage !== "function") {
      results.push({
        module: name,
        error: "Module not valid",
        success: false,
      });
      continue;
    }

    try {
      const start = Date.now();
      const output = await mod.runTriage(payload);
      const executionTime = Date.now() - start;
      results.push({
        module: name,
        output,
        success: true,
        executionTime,
      });
    } catch (error) {
      results.push({
        module: name,
        error: error instanceof Error ? error.message : "Module execution failed",
        success: false,
      });
    }
  }

  return results;
}
