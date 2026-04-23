import express from "express";
import { createServer as createViteServer } from "vite";
import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { parseIntent } from "./engine/intent-parser.ts";
import { decide } from "./engine/decision-engine.ts";
import { runAction } from "./engine/action-runner.ts";
import { recall, remember } from "./engine/memory-store.ts";
import { generateDiff } from "./engine/proposals/diff.ts";
import { getProposals, saveProposal, updateProposalStatus } from "./engine/proposals/store.ts";
import type { Proposal, ProposalStatus, ProposalType } from "./engine/proposals/schema.ts";

dotenv.config();

const app = express();
// `process.env.PORT` is `string | undefined`; ensure we pass a `number` to `app.listen`.
const PORT = Number(process.env.PORT ?? 3001) || 3001;

app.use(express.json());

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const configuredToken = process.env.ADMIN_TOKEN;
  const providedToken = req.header("x-admin-token");

  if (!configuredToken) {
    return res.status(503).json({ detail: "Admin access is not configured." });
  }

  if (!providedToken || providedToken !== configuredToken) {
    return res.status(403).json({ detail: "Unauthorized" });
  }

  next();
}

const allowedProposalRoots = ["config", "engine", "modules", "src"];

function resolveProposalPath(targetPath: string) {
  const normalizedPath = targetPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const isAllowed = allowedProposalRoots.some(
    (root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`),
  );

  if (!isAllowed) {
    return null;
  }

  return path.join(process.cwd(), normalizedPath);
}

// Square Client Initialization (Lazy)
let squareClient: SquareClient | null = null;
function getSquareClient() {
  if (!squareClient) {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("SQUARE_ACCESS_TOKEN environment variable is required");
    }
    squareClient = new SquareClient({
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
      token: accessToken,
    });
  }
  return squareClient;
}

// Payment API Route
app.post("/api/payment", async (req, res) => {
  try {
    const { sourceId, amount } = req.body;
    const client = getSquareClient();
    
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // amount in cents
        currency: 'USD',
      },
    });
    
    // Convert BigInt to string before JSON serialization
    const paymentResult = JSON.parse(
      JSON.stringify(response.payment, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    res.json({ success: true, payment: paymentResult });
  } catch (error: any) {
    console.error("Payment failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/system/execute", requireAdmin, async (req, res) => {
  try {
    const input = typeof req.body?.input === "string" ? req.body.input : "";

    if (!input.trim()) {
      return res.status(400).json({ detail: "Input is required." });
    }

    const intent = parseIntent(input);
    const decision = decide(intent);
    const result = await runAction(decision.action, decision.payload);

    remember({ input, intent, decision, result });

    return res.json({
      intent,
      decision,
      result,
      memory: recall(),
    });
  } catch (error: any) {
    return res.status(500).json({
      detail: error?.message || "System execution failed.",
    });
  }
});

app.get("/api/system/proposals", requireAdmin, (_req, res) => {
  return res.json(getProposals());
});

app.post("/api/system/proposals", requireAdmin, (req, res) => {
  try {
    const type = String(req.body?.type ?? "") as ProposalType;
    const targetPath = String(req.body?.targetPath ?? "").trim();
    const after = String(req.body?.after ?? "");
    const author = req.body?.author === "agent" ? "agent" : "admin";

    if (!["module", "config", "ui", "engine"].includes(type)) {
      return res.status(422).json({ detail: "Invalid proposal type." });
    }

    if (!targetPath || !after) {
      return res.status(422).json({ detail: "Proposal targetPath and after content are required." });
    }

    const resolvedPath = resolveProposalPath(targetPath);
    if (!resolvedPath) {
      return res.status(403).json({ detail: "Target path is outside the allowed proposal roots." });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ detail: "Target file does not exist." });
    }

    const before = fs.readFileSync(resolvedPath, "utf-8");
    const proposal: Proposal = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      targetPath,
      before,
      after,
      diff: generateDiff(before, after, targetPath),
      status: "pending" as const,
      author,
    };

    saveProposal(proposal);

    return res.json(proposal);
  } catch (error: any) {
    return res.status(500).json({ detail: error?.message || "Failed to create proposal." });
  }
});

app.post("/api/system/proposals/update", requireAdmin, (req, res) => {
  const id = String(req.body?.id ?? "");
  const status = String(req.body?.status ?? "") as ProposalStatus;

  if (!id || !["approved", "rejected", "deployed", "pending"].includes(status)) {
    return res.status(422).json({ detail: "Valid proposal id and status are required." });
  }

  updateProposalStatus(id, status);
  return res.json({ ok: true });
});

app.get("/api/system/evolution", requireAdmin, (_req, res) => {
  try {
    const proposalEvents = getProposals().map((proposal) => ({
      id: proposal.id,
      type: "proposal" as const,
      timestamp: proposal.timestamp,
      label: `${proposal.status.toUpperCase()} ${proposal.targetPath}`,
    }));

    const memoryEvents = recall(20)
      .filter((entry) => {
        const result = entry.result as Record<string, unknown>;
        return result && Array.isArray(result.scored);
      })
      .map((entry) => {
        const result = entry.result as Record<string, unknown>;
        const winner = result.winner as Record<string, unknown> | undefined;

        return {
          id: `execution-${entry.id}`,
          type: "execution" as const,
          timestamp: new Date(entry.timestamp).getTime(),
          label: `Execution ${String(winner?.module ?? "unknown winner")}`,
          score: typeof winner?.score === "number" ? winner.score : undefined,
        };
      });

    const gitLines = execSync('git log --pretty=format:"%H|%ct|%s" -n 8', {
      cwd: process.cwd(),
      encoding: "utf-8",
    })
      .split("\n")
      .filter(Boolean);

    const commitEvents = gitLines.map((line) => {
      const [sha, timestamp, subject] = line.split("|");
      return {
        id: sha,
        type: "commit" as const,
        timestamp: Number(timestamp) * 1000,
        label: subject,
      };
    });

    return res.json(
      [...proposalEvents, ...memoryEvents, ...commitEvents].sort((a, b) => b.timestamp - a.timestamp),
    );
  } catch (error: any) {
    return res.status(500).json({ detail: error?.message || "Failed to build evolution view." });
  }
});

app.get("/api/system/agent-arena", requireAdmin, (_req, res) => {
  try {
    const runs = recall(100)
      .map((entry) => (entry.result as Record<string, unknown>)?.scored)
      .filter((scored): scored is Array<Record<string, unknown>> => Array.isArray(scored));

    const stats = new Map<string, { name: string; score: number; wins: number; uses: number; executionTimeTotal: number }>();

    for (const run of runs) {
      const winner = [...run]
        .filter((result) => typeof result.score === "number")
        .sort((a, b) => Number(b.score) - Number(a.score))[0];

      for (const result of run) {
        const name = String(result.module ?? "unknown");
        const entry = stats.get(name) ?? {
          name,
          score: 0,
          wins: 0,
          uses: 0,
          executionTimeTotal: 0,
        };

        entry.score += Number(result.score ?? 0);
        entry.uses += 1;
        entry.executionTimeTotal += Number(result.executionTime ?? 0);
        if (winner && winner.module === name) {
          entry.wins += 1;
        }

        stats.set(name, entry);
      }
    }

    const ranked = [...stats.values()]
      .map((entry) => ({
        name: entry.name,
        score: entry.uses > 0 ? entry.score / entry.uses : 0,
        wins: entry.wins,
        uses: entry.uses,
        avgExecutionTime: entry.uses > 0 ? entry.executionTimeTotal / entry.uses : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        isLeader: index === 0,
      }));

    return res.json(ranked);
  } catch (error: any) {
    return res.status(500).json({ detail: error?.message || "Failed to build agent arena." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
