import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Activity, User, FileText, Calendar, LogOut, Bell, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function SecurePortalLayout({ children, userRole }: { children: React.ReactNode, userRole: 'Patient' | 'Doctor' }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-3xl hidden lg:flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-2xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none">Lodge <span className="text-blue-500">Secure</span></h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{userRole} Portal</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          <PortalNavItem icon={Activity} label="Clinical Dashboard" active />
          <PortalNavItem icon={FileText} label="Health Records" />
          <PortalNavItem icon={Calendar} label="Appointments" />
          <PortalNavItem icon={User} label="Profile & Security" />
        </nav>

        <div className="mt-auto space-y-4">
           <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-600/10 mb-8">
             <div className="flex items-center gap-2 mb-3">
               <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 leading-none">GDPR/HIPAA Active</span>
             </div>
             <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Your data remains in a cold-storage sandbox until active session verification.</p>
           </div>
           
           <button 
             onClick={() => navigate('/')}
             className="w-full py-4 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-3 px-6 text-xs text-slate-400 font-bold uppercase tracking-widest"
           >
             <LogOut className="w-4 h-4" />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md sticky top-0 z-50">
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Environment: <span className="text-blue-500">Production Sandbox A-14</span></h2>
           
           <div className="flex items-center gap-6">
             <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center relative hover:bg-white/10 transition-all">
               <Bell className="w-5 h-5 text-slate-400" />
               <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#020617]" />
             </button>
             <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
               <Settings className="w-5 h-5 text-slate-400" />
             </button>
             <div className="w-px h-8 bg-white/10" />
             <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                 <p className="text-xs font-black text-white tracking-widest uppercase">Verified {userRole}</p>
                 <p className="text-[10px] text-slate-500 font-medium">{userRole === 'Doctor' ? 'MedID: LO-99321' : 'PatientID: LO-4481'}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center">
                 <User className="w-5 h-5 text-slate-400" />
               </div>
             </div>
           </div>
        </header>

        <main className="p-8 md:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function PortalNavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${active ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'}`} />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      {active && <motion.div layoutId="nav-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
    </button>
  );
}
