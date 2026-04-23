import { useEffect, useState } from "react";

import { getSystemEvolution, type EvolutionEvent } from "../../../services/systemControlApi";
import { onEvent } from "../state/stream";

export default function EvolutionGraph({
  adminToken,
  compact = false,
  embedded = false,
  eventsOnly = false,
}: {
  adminToken: string;
  compact?: boolean;
  embedded?: boolean;
  eventsOnly?: boolean;
}) {
  const [events, setEvents] = useState<EvolutionEvent[]>([]);

  useEffect(() => {
    const trimmedToken = adminToken.trim();
    if (!trimmedToken && !embedded) {
      setEvents([]);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const next = await getSystemEvolution(trimmedToken);
        if (active) {
          setEvents(next);
        }
      } catch {
        if (active) {
          setEvents([]);
        }
      }
    };

    if (!embedded) {
      void load();
    }
    const unsubscribe = onEvent((event) => {
      if (event.type === "execution") {
        const winner = event.payload?.result?.winner;
        const timestamp = Number(event.payload?.timestamp ?? Date.now());
        setEvents((current) => [
          {
            id: `execution-live-${timestamp}`,
            type: "execution",
            timestamp,
            label: `Execution ${String(winner?.module ?? "unknown winner")}`,
            score: typeof winner?.score === "number" ? winner.score : undefined,
          },
          ...current.filter((entry) => entry.id !== `execution-live-${timestamp}`).slice(0, 39),
        ]);
      }

      if (event.type === "proposal_update" && event.payload?.id) {
        setEvents((current) => [
          {
            id: String(event.payload.id),
            type: "proposal",
            timestamp: Number(event.payload.timestamp ?? Date.now()),
            label: `${String(event.payload.status ?? "pending").toUpperCase()} ${String(
              event.payload.targetPath ?? "proposal",
            )}`,
          },
          ...current.filter((entry) => entry.id !== String(event.payload.id)).slice(0, 39),
        ]);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [adminToken, embedded]);

  return (
    <section
      className={`h-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(2,6,23,0.94))] shadow-[0_18px_60px_rgba(2,6,23,0.3)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Evolution View</p>
          <h2 className="mt-2 text-lg font-black text-white">System Timeline</h2>
        </div>
        <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
          Live history
        </div>
      </div>

      {!eventsOnly ? (
        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4">
          <div className="grid grid-cols-3 gap-3">
            <Insight label="Events" value={String(events.length)} />
            <Insight label="Recent proposals" value={String(events.filter((event) => event.type === "proposal").length)} />
            <Insight label="Executions" value={String(events.filter((event) => event.type === "execution").length)} />
          </div>
        </div>
      ) : null}

      <div className={`mt-4 space-y-3 overflow-y-auto pr-1 ${compact ? "max-h-[280px]" : "max-h-[420px]"}`}>
        {events.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
            No evolution events available yet.
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <div
                className={`absolute left-0 top-0 h-full w-1 ${
                  event.type === "proposal"
                    ? "bg-violet-400/70"
                    : event.type === "commit"
                      ? "bg-emerald-400/70"
                      : "bg-cyan-400/70"
                }`}
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{event.type}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{event.label}</p>
                </div>
                {typeof event.score === "number" ? (
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                    {event.score.toFixed(3)}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
