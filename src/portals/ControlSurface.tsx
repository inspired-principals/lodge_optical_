import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldAlert, MonitorCheck, Zap, Ghost, Database, AlertCircle, Key, RefreshCcw, Power } from 'lucide-react';
import { ClinicalEmitter } from '../services/emitter';
import { ClinicalEvent } from '../types/clinical';

export default function ControlSurface() {
  const [events, setEvents] = useState<ClinicalEvent[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const fetchEvents = () => {
      if (!isLive) return;
      setEvents([...ClinicalEmitter.getRecentEvents()].reverse());
    };
    
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  const metrics = calculateMetrics(events);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Brutal Header */}
      <header className="px-8 h-20 border-b border-white/10 bg-black/40 backdrop-blur-3xl flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.4)]">
             <Zap className="w-6 h-6 text-white" />
           </div>
           <div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase italic">CONTROL_SURFACE <span className="text-orange-500 text-xs not-italic">v3.42-α</span></h1>
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-600">Operational Intelligence Framework</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Link Active</span>
           </div>
           <button 
             onClick={() => setIsLive(!isLive)}
             className={`p-3 rounded-xl transition-all ${isLive ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-800 text-slate-400'}`}
           >
             <RefreshCcw className={`w-5 h-5 ${isLive ? 'animate-spin-slow' : ''}`} />
           </button>
           <div className="w-px h-8 bg-white/10" />
           <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white group">
             Force Logout <Power className="w-4 h-4 group-hover:text-red-500" />
           </button>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-12 gap-px bg-white/5 overflow-hidden">
        
        {/* SECTION 1: LIVE FEED (THE SIGNAL) */}
        <section className="col-span-12 lg:col-span-4 bg-[#020617] flex flex-col h-[calc(100vh-5rem)]">
           <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                 <Activity className="w-4 h-4 text-blue-500" />
                 Signal Stream
              </h2>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{events.length} Recent Packets</span>
           </div>
           
           <div className="flex-grow overflow-y-auto p-4 space-y-2 scrollbar-none">
              <AnimatePresence initial={false}>
                {events.map((evt) => (
                  <motion.div 
                    key={evt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start justify-between group hover:bg-white/[0.08] transition-all"
                  >
                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 leading-none">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-xs font-black text-slate-200 uppercase tracking-tight">{evt.event}</span>
                        {Object.keys(evt.payload).length > 0 && (
                          <span className="text-[10px] font-medium text-slate-500 line-clamp-1">{JSON.stringify(evt.payload)}</span>
                        )}
                     </div>
                     <span className="text-[8px] font-black text-slate-700 group-hover:text-slate-500 transition-colors uppercase">{evt.sessionId.slice(-4)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </section>

        {/* SECTION 2 & 3: ANALYTICS & MONITORING */}
        <section className="col-span-12 lg:col-span-5 bg-[#020817] p-8 space-y-8 overflow-y-auto scrollbar-none">
           
           {/* Metrics Grid */}
           <div className="grid grid-cols-2 gap-4">
              <MetricBox label="Triage Velocity" value={`${metrics.completionRate}%`} trend="Live" icon={Zap} color="blue" />
              <MetricBox label="Camera vs Manual" value={`${metrics.modeRatio}%`} trend="Bias: Manual" icon={Ghost} color="orange" />
              <MetricBox label="Conversion Depth" value="31.2%" trend="+4% Target" icon={Database} color="emerald" />
              <MetricBox label="Mean Latency" value="42ms" trend="Optimal" icon={MonitorCheck} color="slate" />
           </div>

           {/* Behavioral Triggers / Observations */}
           <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                 <Activity className="w-5 h-5 text-purple-500" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">Trinity Segmentation</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <SegmentTag label="SKEPTIC" count={metrics.segments.skeptic} active={metrics.topSegment === 'skeptic'} />
                 <SegmentTag label="COMPLIANT" count={metrics.segments.compliant} active={metrics.topSegment === 'compliant'} />
                 <SegmentTag label="ANALYZER" count={metrics.segments.analyzer} active={metrics.topSegment === 'analyzer'} />
                 <SegmentTag label="DISTRESSED" count={metrics.segments.distressed} active={metrics.topSegment === 'distressed'} />
              </div>

              <div className="space-y-4">
                 <ObservationRow 
                   label="Arbitration Safety" 
                   value={metrics.conversionsSuppressed > 0 ? 'ACTIVE' : 'STABLE'} 
                   level={metrics.conversionsSuppressed > 0 ? 'WARNING' : 'SUCCESS'} 
                   desc={`Accuracy-over-Conversion suppression triggered ${metrics.conversionsSuppressed} times due to low confidence.`} 
                 />
              </div>
           </div>

           {/* Real-time Health Monitor */}
           <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600 mb-8 leading-none">Global Infrastructure State</h3>
              <div className="space-y-6">
                 <HealthBar label="Auth Framework" status="OPTIMAL" value={98} />
                 <HealthBar label="Signal Propagation" status="WARM" value={72} />
                 <HealthBar label="System Health" status="STABLE" value={94} />
              </div>
           </div>

        </section>

        {/* SECTION 4: ACTION PANEL (FORCE & CONTROL) */}
        <section className="col-span-12 lg:col-span-3 bg-[#020617] p-8 border-l border-white/5 flex flex-col gap-8">
           
           <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8 leading-none">Operational Overrides</h3>
              <div className="space-y-3">
                 <ActionButton label="KILL ALL ACTIVE SESSIONS" color="red" icon={Power} />
                 <ActionButton label="DISABLE MAGIC LINK DISPATCH" color="orange" icon={Key} />
                 <ActionButton label="ENGAGE MAINTENANCE MODE" color="slate" icon={ShieldAlert} />
              </div>
           </div>

           <div className="p-6 rounded-3xl bg-blue-600 border border-blue-400/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Database className="w-32 h-32 text-white" />
              </div>
              <h4 className="text-xl font-black text-white mb-2 leading-none">Diagnostic Push</h4>
              <p className="text-[10px] text-blue-100 font-medium mb-6 uppercase tracking-widest">Manual Inscription Layer</p>
              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                 Generate Link Manually
              </button>
           </div>

           <div className="mt-auto pt-8 border-t border-white/5 text-center">
              <p className="text-[8px] font-bold tracking-widest text-slate-700 uppercase mb-2">Authenticated Operator</p>
              <div className="flex items-center justify-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                 <span className="text-[10px] font-black text-slate-500 uppercase">Master Suite active</span>
              </div>
           </div>
        </section>

      </main>
    </div>
  );
}

function MetricBox({ label, value, trend, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
    orange: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    slate: 'border-white/10 bg-white/5 text-slate-400'
  };
  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} relative group overflow-hidden`}>
       <Icon className="w-12 h-12 absolute -top-2 -right-2 opacity-5 group-hover:scale-110 transition-transform" />
       <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <h4 className="text-3xl font-black mb-1">{value}</h4>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{trend}</p>
    </div>
  );
}

function ObservationRow({ label, value, level, desc }: any) {
  const levels: any = {
    CRITICAL: 'text-red-500',
    WARNING: 'text-orange-500',
    SUCCESS: 'text-emerald-500'
  };
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
       <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${levels[level]}`}>{label}</span>
          <span className="text-[10px] font-bold text-slate-100">{value}</span>
       </div>
       <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function HealthBar({ label, status, value }: any) {
  return (
    <div className="space-y-3">
       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-400">{label}</span>
          <span className={status === 'OPTIMAL' ? 'text-emerald-500' : 'text-orange-500'}>{status}</span>
       </div>
       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            className={`h-full ${status === 'OPTIMAL' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-orange-500'}`}
          />
       </div>
    </div>
  );
}

function ActionButton({ label, color, icon: Icon }: any) {
  const colors: any = {
    red: 'border-red-500/20 hover:bg-red-500/10 text-red-400',
    orange: 'border-orange-500/20 hover:bg-orange-500/10 text-orange-400',
    slate: 'border-white/10 hover:bg-white/10 text-slate-400'
  };
  return (
    <button className={`w-full py-4 border rounded-2xl flex items-center gap-4 px-6 transition-all ${colors[color]}`}>
       <Icon className="w-4 h-4" />
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function SegmentTag({ label, count, active }: any) {
  return (
    <div className={`px-4 py-3 rounded-2xl border transition-all ${active ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/5 text-slate-500'}`}>
       <div className="flex justify-between items-center">
          <span className="text-[9px] font-black tracking-widest leading-none">{label}</span>
          <span className="text-[10px] font-bold">{count}</span>
       </div>
    </div>
  );
}

function calculateMetrics(events: ClinicalEvent[]) {
  const triageStarts = events.filter(e => e.event === 'triage_started').length;
  const triageCompletions = events.filter(e => e.event === 'triage_completed').length;
  const manualCount = events.filter(e => e.event === 'triage_mode_selected' && e.payload.mode === 'manual').length;
  const cameraCount = events.filter(e => e.event === 'triage_mode_selected' && e.payload.mode === 'camera').length;
  
  // Segment Stats
  const segmentEvents = events.filter(e => e.payload?.segment);
  const segments = {
    skeptic: segmentEvents.filter(e => e.payload.segment === 'skeptic').length,
    compliant: segmentEvents.filter(e => e.payload.segment === 'compliant').length,
    analyzer: segmentEvents.filter(e => e.payload.segment === 'analyzer').length,
    distressed: segmentEvents.filter(e => e.payload.segment === 'distressed').length,
  };

  const topSegment = Object.entries(segments).sort((a,b) => b[1] - a[1])[0]?.[0];

  // Arbitration Stats
  // Arbitration Stats
  const conversionsSuppressed = events.filter(e => e.event === 'api_error' && e.payload?.payload?.type === 'conversion' && e.payload?.message?.includes('suppressed')).length;

  return {
    completionRate: triageStarts > 0 ? Math.round((triageCompletions / triageStarts) * 100) : 0,
    modeRatio: manualCount + cameraCount > 0 ? Math.round((manualCount / (manualCount + cameraCount)) * 100) : 0,
    segments,
    topSegment,
    conversionsSuppressed,
    dropoffStep: null
  };
}
