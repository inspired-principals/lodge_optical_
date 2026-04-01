import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SecurePortalLayout } from './SecurePortalLayout';
import { Users, Activity, LayoutDashboard, Search, Filter, ArrowDownIcon, ShieldAlert, MonitorCheck, ClipboardList, Microchip } from 'lucide-react';

export default function DoctorPortal() {
  const [activeTab, setActiveTab] = useState<'roster' | 'analytics'>('roster');

  return (
    <SecurePortalLayout userRole="Doctor">
      <div className="space-y-10">
        
        {/* Clinician Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard label="Active Patient Care" value="124" trend="+4 This Week" icon={Users} />
           <StatCard label="Triage Pending Response" value="12" trend="Urgent: 3" icon={ShieldAlert} alert />
           <StatCard label="Optimization Rate" value="94%" trend="+1.2%" icon={Activity} />
           <StatCard label="Cold Storage Sync" value="Live" trend="LO-Cloud v4" icon={MonitorCheck} />
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 gap-10 p-2">
           <button onClick={() => setActiveTab('roster')} className={`pb-4 px-2 font-black text-xs uppercase tracking-[0.3em] transition-all relative ${activeTab === 'roster' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}>
              Specialty Patient Roster
              {activeTab === 'roster' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 shadow-2xl" />}
           </button>
           <button onClick={() => setActiveTab('analytics')} className={`pb-4 px-2 font-black text-xs uppercase tracking-[0.3em] transition-all relative ${activeTab === 'analytics' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}>
              Fit Analytics & Outcome Tracking
              {activeTab === 'analytics' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 shadow-2xl" />}
           </button>
        </div>

        {activeTab === 'roster' ? (
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-black/40 p-6 rounded-[2rem] border border-white/5 gap-8">
               <div className="flex-grow relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by Patient Name, ID, or Condition..." 
                    className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl pl-16 pr-6 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all font-medium placeholder:text-slate-700" 
                  />
               </div>
               <button className="h-14 px-8 rounded-2xl border border-white/10 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all">
                  <Filter className="w-4 h-4" /> Filter Specialty
               </button>
             </div>

             <div className="dark-glass rounded-[3rem] border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="border-b border-white/5 bg-white/5">
                    <tr>
                      <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Patient Profile</th>
                      <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Condition Focus</th>
                      <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Acuity Velocity</th>
                      <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                      <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <PatientRow name="Andrew Richards" id="LO-4481" condition="Keratoconus" acuity="20/40 OS | 20/30 OD" status="Stable" />
                    <PatientRow name="Sarah Connor" id="LO-8812" condition="Post-Surgical RK" acuity="20/25 Binoc" status="Alert" alert />
                    <PatientRow name="Mark Peterson" id="LO-2210" condition="Severe MGD / Dry Eye" acuity="Ocular Surface Mod" status="Treatment Change" />
                    <PatientRow name="Elena Vance" id="LO-1102" condition="Pellucid Marginal" acuity="20/30 OS | 20/25 OD" status="Optimized" />
                  </tbody>
                </table>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-10 rounded-[3rem] dark-glass bg-blue-600 border border-blue-400/20 text-white relative overflow-hidden flex flex-col items-start gap-8">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                   <Microchip className="w-64 h-64 text-white" />
                </div>
                <h4 className="text-3xl font-black mb-2 tracking-tight">Outcome Predictive Analysis</h4>
                <p className="text-blue-100 max-w-sm font-medium leading-relaxed">AI engine predicting lens optimization success based on initial corneal morphology and current acuity velocity.</p>
                <div className="w-full p-8 rounded-[2rem] bg-black/20 border border-white/5 backdrop-blur-3xl mt-4">
                   <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Recovery Confidence</span>
                      <span className="text-2xl font-black">88.4%</span>
                   </div>
                   <div className="w-full h-2 bg-blue-900/50 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '88.4%' }} className="h-full bg-white shadow-[0_0_20px_white]" />
                   </div>
                </div>
                <button className="py-4 px-8 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl">View Dataset</button>
             </div>
             <div className="p-10 rounded-[3rem] dark-glass border border-white/5 flex flex-col justify-between">
                <div>
                   <h4 className="text-2xl font-black mb-2 tracking-tight text-white uppercase tracking-widest text-xs opacity-50 mb-6">Optimization Checklist</h4>
                   <div className="space-y-6">
                      <OptimizationStep label="Corneal Map Comparison" />
                      <OptimizationStep label="Scleral Clearance Verification" />
                      <OptimizationStep label="Toric Lens Alignment Monitoring" />
                      <OptimizationStep label="Tear Film Stability Check" />
                   </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-10">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 leading-none">Global Database Sync</p>
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Cross-referencing against 14k+ documented specialty cases for pattern recognition.</p>
                </div>
             </div>
          </div>
        )}

      </div>
    </SecurePortalLayout>
  );
}

function StatCard({ label, value, trend, icon: Icon, alert = false }: { label: string, value: string, trend: string, icon: any, alert?: boolean }) {
  return (
    <div className={`p-8 rounded-[2.5rem] bg-slate-900/40 border ${alert ? 'border-red-500/20' : 'border-white/5'} hover:bg-white/[0.04] transition-all relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
        <Icon className="w-16 h-16" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">{label}</p>
      <h4 className="text-4xl font-black text-white mb-3 tracking-tighter">{value}</h4>
      <p className={`text-[10px] font-black uppercase tracking-widest ${alert ? 'text-red-400' : 'text-blue-400'}`}>{trend}</p>
    </div>
  );
}

function PatientRow({ name, id, condition, acuity, status, alert = false }: any) {
  return (
    <tr className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
      <td className="p-8">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-black text-sm text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all uppercase">
             {name.split(' ').map((n: string) => n[0]).join('')}
           </div>
           <div>
              <p className="font-bold text-white text-lg tracking-tight leading-none mb-1">{name}</p>
              <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">{id}</p>
           </div>
        </div>
      </td>
      <td className="p-8">
        <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
          {condition}
        </span>
      </td>
      <td className="p-8 text-xs font-black text-slate-300 uppercase tracking-widest">{acuity}</td>
      <td className="p-8">
         <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${alert ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-emerald-500'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${alert ? 'text-red-400' : 'text-slate-400'}`}>{status}</span>
         </div>
      </td>
      <td className="p-8">
         <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400">
            Open Records <MonitorCheck className="w-4 h-4" />
         </button>
      </td>
    </tr>
  );
}

function OptimizationStep({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10">
       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
       <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <MonitorCheck className="w-4 h-4 text-emerald-500" />
       </div>
    </div>
  );
}
