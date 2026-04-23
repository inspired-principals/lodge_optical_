type SystemHeaderProps = {
  adminToken: string;
  onAdminTokenChange: (value: string) => void;
  activeModule?: string;
  proposalCount: number;
  error: string;
  lastHeartbeat: number | null;
};

export default function SystemHeader({
  adminToken,
  onAdminTokenChange,
  activeModule,
  proposalCount,
  error,
  lastHeartbeat,
}: SystemHeaderProps) {
  const heartbeatAge = lastHeartbeat ? Date.now() - lastHeartbeat : null;
  const heartbeatOnline = heartbeatAge !== null && heartbeatAge < 5000;

  return (
    <div className="grid h-full items-center gap-4 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.9))] px-5 xl:grid-cols-[1.45fr_1fr]">
      <div className="flex flex-col justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">
              System Control IDE
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">
              Human-governed evolution
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${
              heartbeatOnline
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-amber-400/20 bg-amber-400/10 text-amber-200"
            }`}>
              <span className={`h-2.5 w-2.5 rounded-full ${heartbeatOnline ? "animate-pulse bg-emerald-300" : "bg-amber-300"}`} />
              {heartbeatOnline ? "Stream live" : "Stream waiting"}
            </span>
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl font-black tracking-tight text-white md:text-[2rem]">
            Lodge Optical Evolution Workspace
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Govern the live decision system, inspect evolution pressure, and review file-level proposals without mutating runtime logic directly.
          </p>
        </div>

        <div className="hidden gap-3 sm:grid-cols-3 xl:grid">
          <SignalCard label="Mutation Surface" value="Proposal-first" tone="cyan" />
          <SignalCard label="Runtime Policy" value="No direct writes" tone="violet" />
          <SignalCard label="Governance" value="Review required" tone="emerald" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Operator Access</p>
          <input
            value={adminToken}
            onChange={(event) => onAdminTokenChange(event.target.value)}
            type="password"
            placeholder="Admin token"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">Token stays in the active browser session only.</p>
        </div>

        <Metric label="Active Module" value={activeModule || "Unknown"} accent="cyan" />
        <Metric label="Proposal Queue" value={String(proposalCount)} accent="violet" />
      </div>

      {error ? (
        <div className="xl:col-span-2 rounded-2xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function SignalCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "emerald";
}) {
  const toneClasses = {
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-100",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-100",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
  };

  return (
    <div className={`rounded-[1.35rem] border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "cyan" | "violet";
}) {
  const accentClasses = {
    cyan: "text-cyan-100 ring-cyan-500/20",
    violet: "text-violet-100 ring-violet-500/20",
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${accentClasses[accent]}`}>
        {value}
      </p>
    </div>
  );
}
