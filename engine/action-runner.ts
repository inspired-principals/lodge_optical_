import fs from "node:fs";
import path from "node:path";
import { runModules } from "./module-runner.ts";
import { scoreResults, selectBest } from "./scoring.ts";
import { emit } from "./events/bus.ts";

type SystemConfig = {
  features: Record<string, boolean>;
  activeModules: Record<string, string>;
  modules: Record<string, string[]>;
  scoring: {
    strategy: string;
    active: boolean;
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

const configPath = path.join(process.cwd(), "config", "system.json");
const backupPath = path.join(process.cwd(), "config", "backups.json");

function readConfig(): SystemConfig {
  return JSON.parse(fs.readFileSync(configPath, "utf-8")) as SystemConfig;
}

function writeConfig(config: SystemConfig) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function snapshotConfig(config: SystemConfig) {
  const existingBackups = fs.existsSync(backupPath)
    ? (JSON.parse(fs.readFileSync(backupPath, "utf-8")) as Array<Record<string, unknown>>)
    : [];

  existingBackups.push({
    timestamp: new Date().toISOString(),
    config,
  });

  fs.writeFileSync(backupPath, JSON.stringify(existingBackups, null, 2));
}

export async function runAction(action: string, payload?: Record<string, unknown>) {
  switch (action) {
    case "UPDATE_MODULE": {
      const config = readConfig();
      const moduleName = String(payload?.module ?? "");

      if (!moduleName) {
        return { status: "invalid", reason: "Missing module name" };
      }

      const triagePool = config.modules.triage ?? [];
      if (!triagePool.includes(moduleName)) {
        return { status: "invalid", reason: `Module ${moduleName} is not registered in the triage pool` };
      }

      snapshotConfig(config);
      config.activeModules.triage = moduleName;
      writeConfig(config);

      return { status: "updated", module: moduleName, config };
    }

    case "TOGGLE_FEATURE": {
      const config = readConfig();
      const featureName = String(payload?.feature ?? "");

      if (!featureName || typeof payload?.value !== "boolean") {
        return { status: "invalid", reason: "Missing feature toggle payload" };
      }

      snapshotConfig(config);
      config.features[featureName] = payload.value;
      writeConfig(config);

      return { status: "toggled", feature: featureName, value: payload.value, config };
    }

    case "RUN_TRIAGE": {
      const config = readConfig();
      const moduleList = config.modules.triage ?? [];

      if (moduleList.length === 0) {
        return { status: "invalid", reason: "No triage modules registered" };
      }

      const results = await runModules(moduleList, payload ?? {});
      const scored = config.scoring.active
        ? scoreResults(results, config)
        : results.map((result) => ({ ...result, score: 0, breakdown: {} }));
      const winner = config.scoring.active ? selectBest(scored) : scored[0] ?? null;

      for (const scoredResult of scored) {
        emit({
          type: "agent_score",
          payload: {
            module: scoredResult.module,
            score: scoredResult.score,
            breakdown: scoredResult.breakdown,
            executionTime: scoredResult.executionTime ?? 0,
            timestamp: Date.now(),
          },
        });
      }

      if (winner?.success) {
        snapshotConfig(config);
        config.activeModules.triage = winner.module;
        writeConfig(config);
      }

      return {
        status: "evaluated",
        strategy: config.scoring.strategy,
        activeModule: config.activeModules.triage,
        winner,
        scored,
      };
    }

    default:
      return { status: "noop" };
  }
}
