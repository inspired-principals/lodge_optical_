import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SecurePortalLayout } from './SecurePortalLayout';
import { Activity, ShieldCheck, FileDown, Calendar, ArrowUpRight, TrendingUp, Info } from 'lucide-react';

export default function PatientPortal() {
  const [acuity, setAcuity] = useState({ os: '20/40', od: '20/30' });

  useEffect(() => {
    // In a real sandbox, this would be a secure API call.
    // We'll simulate fetching from our OptiScan Lite session.
    const stored = localStorage.getItem('lodge_last_acuity');
    if (stored) {
      setAcuity(JSON.parse(stored));
    }
  }, []);

  return (
    <SecurePortalLayout userRole="Patient">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Welcome Header */}
        <div className="lg:col-span-3 mb-4">
           <h3 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
              Hello, Andrew
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 leading-none">Healthy Baseline Stable</span>
              </div>
           </h3>
           <p className="text-lg text-slate-500 font-medium">Your next specialty lens evaluation is in <strong className="text-white">14 days</strong>.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="lg:col-span-2 space-y-8">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AcuityCard eye="Left Eye (OS)" value={acuity.os} trend="+1 Line" progress={60} />
              <AcuityCard eye="Right Eye (OD)" value={acuity.od} trend="Stable" progress={80} />
           </div>

           {/* Longitudinal History Chart - Mocked with SVG */}
           <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div>
                   <h4 className="text-xl font-bold text-white mb-1">Acuity Longitudinal Progression</h4>
                   <p className="text-xs text-slate-500 font-medium tracking-wide">Tracking corneal stability over 12 months.</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">1 Year</div>
                </div>
              </div>

              {/* Mock Graph */}
              <div className="h-64 w-full relative group">
                 <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,100 Q100,80 200,90 T400,110 T600,70 T800,85" stroke="#3b82f6" strokeWidth="4" fill="none" className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <path d="M0,100 Q100,80 200,90 T400,110 T600,70 T800,85 L800,200 L0,200 Z" fill="url(#lineGrad)" />
                    {/* Data Points */}
                    <circle cx="200" cy="90" r="6" fill="#020617" stroke="#3b82f6" strokeWidth="3" />
                    <circle cx="600" cy="70" r="6" fill="#020617" stroke="#3b82f6" strokeWidth="3" />
                 </svg>
                 <div className="absolute top-10 left-[25%] opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 p-4 rounded-2xl shadow-3xl text-xs pointer-events-none">
                    <p className="font-bold">May 2026 Snapshot</p>
                    <p className="text-blue-100 italic opacity-80">20/40 Optimized (Scleral Fit)</p>
                 </div>
              </div>
              
              <div className="mt-8 flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                 <span>May 25</span>
                 <span>Jul 25</span>
                 <span>Sep 25</span>
                 <span>Nov 25</span>
                 <span>Jan 26</span>
                 <span>Mar 26</span>
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-blue-600 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-48 h-48" />
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight">Your OptiScan Data is Encrypted.</h4>
              <p className="text-blue-100 max-w-lg mb-8 leading-relaxed">
                As per SecureSource v2, all biometric markers are stored in a cold-storage vault. You are only seeing a cached projection of your records for this session.
              </p>
              <button className="py-4 px-8 bg-white text-blue-600 rounded-2xl font-black tracking-widest uppercase text-xs shadow-2xl flex items-center gap-3">
                <FileDown className="w-4 h-4" /> Download Raw Clinical File
              </button>
           </div>

        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
           
           <div className="p-6 rounded-[2rem] bg-slate-900 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                    <Calendar className="w-5 h-5 text-orange-500" />
                 </div>
                 <h5 className="font-black text-white text-xs uppercase tracking-widest">Upcoming Assessment</h5>
              </div>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date & Time</p>
                   <p className="font-bold text-white uppercase text-xs">April 12, 2026 @ 10:45 AM</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Clinician</p>
                   <p className="font-bold text-white uppercase text-xs">Dr. Mark Lodge (O.D.)</p>
                 </div>
                 <button className="w-full py-4 rounded-2xl border border-blue-500/20 text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-500/5 transition-all">
                   Manage Appointment
                 </button>
              </div>
           </div>

           <div className="p-6 rounded-[2rem] bg-slate-950 border border-blue-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <TrendingUp className="w-12 h-12 text-blue-500 opacity-10" />
              </div>
              <h5 className="font-black text-white text-xs uppercase tracking-widest mb-4">Treatment Plan</h5>
              <div className="space-y-4">
                 <TreatmentStep label="Daily Saline Optimization" done />
                 <TreatmentStep label="Overnight Scleral Deep-Clean" done />
                 <TreatmentStep label="Surface Lubrication (TID)" active />
                 <TreatmentStep label="Corneal Map Comparison" />
              </div>
           </div>

           <div className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center mb-4">
                 <Info className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Need Clinical Support?</p>
              <p className="text-[11px] text-slate-600 font-medium mb-6 px-4">Our specialized clinical team is available for emergency ocular inquiries.</p>
              <button className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-all">
                Contact Specialist
              </button>
           </div>

        </div>

      </div>
    </SecurePortalLayout>
  );
}

function AcuityCard({ eye, value, trend, progress }: { eye: string, value: string, trend: string, progress: number }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 relative group hover:bg-white/[0.08] transition-all">
      <div className="absolute top-4 right-4 text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 px-3 py-1 rounded-full bg-emerald-500/10">
        {trend}
      </div>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{eye}</p>
      <h4 className="text-6xl font-black text-white mb-6 tracking-tighter group-hover:scale-105 transition-transform origin-left">{value}</h4>
      
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
        />
      </div>
      <div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600">
        <span>Vision Potential</span>
        <span>{progress}% Optimized</span>
      </div>
    </div>
  );
}

function TreatmentStep({ label, done = false, active = false }: { label: string, done?: boolean, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${active ? 'bg-blue-600/10 border-blue-500/20' : 'border-white/5'}`}>
       <div className={`w-4 h-4 rounded-full border-2 ${done ? 'bg-blue-600 border-blue-600' : active ? 'border-blue-500 animate-pulse' : 'border-slate-800'}`} />
       <span className={`text-[11px] font-bold uppercase tracking-widest ${done ? 'text-slate-500 line-through' : active ? 'text-white' : 'text-slate-600'}`}>
         {label}
       </span>
    </div>
  );
}
