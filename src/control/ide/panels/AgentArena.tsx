import { useEffect, useState } from "react";

import { getSystemAgentArena, type AgentArenaEntry } from "../../../services/systemControlApi";
import { onEvent } from "../state/stream";

export default function AgentArena({ adminToken }: { adminToken: string }) {
  const [agents, setAgents] = useState<AgentArenaEntry[]>([]);

  useEffect(() => {
    const trimmedToken = adminToken.trim();
    if (!trimmedToken) {
      setAgents([]);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const next = await getSystemAgentArena(trimmedToken);
        if (active) {
          setAgents(next);
        }
      } catch {
        if (active) {
          setAgents([]);
        }
      }
    };

    void load();
    const unsubscribe = onEvent((event) => {
      if (event.type !== "agent_score") {
        return;
      }

      setAgents((current) => {
        const next = new Map<string, AgentArenaEntry>(current.map((agent) => [agent.name, agent] as const));
        const name = String(event.payload?.module ?? "unknown");
        const previous = next.get(name);
        next.set(name, {
          name,
          score: Number(event.payload?.score ?? previous?.score ?? 0),
          wins: previous?.wins ?? 0,
          uses: previous ? previous.uses + 1 : 1,
          avgExecutionTime: previous
            ? (previous.avgExecutionTime * previous.uses + Number(event.payload?.executionTime ?? 0)) / (previous.uses + 1)
            : Number(event.payload?.executionTime ?? 0),
          isLeader: false,
        });

        const ranked = Array.from(next.values())
          .sort((a, b) => b.score - a.score)
          .map((agent, index) => ({
            ...agent,
            isLeader: index === 0,
          }));

        return ranked;
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [adminToken]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(2,6,23,0.94))] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.3)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Agent Arena</p>
          <h2 className="mt-2 text-lg font-black text-white">Strategy Competition</h2>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">
          Ranked by history
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard label="Strategies" value={String(agents.length)} />
        <StatCard label="Total Uses" value={String(agents.reduce((sum, agent) => sum + agent.uses, 0))} />
        <StatCard label="Top Score" value={agents[0] ? agents[0].score.toFixed(3) : "0.000"} />
      </div>

      <div className="mt-4 space-y-3">
        {agents.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
            No strategy data available yet.
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.name}
              className={`rounded-2xl border px-4 py-3 ${
                agent.isLeader
                  ? "border-cyan-500/30 bg-[linear-gradient(135deg,rgba(6,182,212,0.14),rgba(15,23,42,0.7))]"
                  : "border-white/10 bg-slate-950/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{agent.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Uses {agent.uses} • Wins {agent.wins}
                  </p>
                </div>
                {agent.isLeader ? (
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                    Leader
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-300">
                <Stat label="Score" value={agent.score.toFixed(3)} />
                <Stat label="Avg Speed" value={`${agent.avgExecutionTime.toFixed(1)}ms`} />
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${
                    agent.isLeader ? "bg-cyan-400" : "bg-white/30"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, agent.score * 100))}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
