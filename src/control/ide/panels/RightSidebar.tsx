import AgentArena from "./AgentArena";
import EvolutionGraph from "./EvolutionGraph";

export default function RightSidebar({
  adminToken,
  activeModule,
  lastHeartbeat,
}: {
  adminToken: string;
  activeModule?: string;
  lastHeartbeat: number | null;
}) {
  const live = lastHeartbeat !== null && Date.now() - lastHeartbeat < 5000;

  return (
    <div className="grid h-full min-h-0 grid-rows-[120px_1fr_1fr] gap-3 p-3">
      <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">System State</p>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <span className="text-xs text-slate-400">Runtime</span>
            <span className={`inline-flex items-center gap-2 text-xs font-semibold ${live ? "text-emerald-200" : "text-amber-200"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${live ? "animate-pulse bg-emerald-300" : "bg-amber-300"}`} />
              {live ? "Reactive" : "Waiting"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <span className="text-xs text-slate-400">Active Module</span>
            <span className="text-xs font-semibold text-cyan-100">{activeModule || "Unknown"}</span>
          </div>
        </div>
      </section>

      <div className="min-h-0 overflow-hidden">
        <AgentArena adminToken={adminToken} compact />
      </div>
      <div className="min-h-0 overflow-hidden">
        <EvolutionGraph adminToken={adminToken} compact />
      </div>
    </div>
  );
}
