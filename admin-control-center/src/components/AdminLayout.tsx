import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Radio, MessageSquare, Shield, Power } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Control Surface', path: '/control', icon: Radio },
    { name: 'AI Assistant', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-3xl flex flex-col p-6 sticky top-0 h-screen">
        <div className="mb-12 px-2">
          <h1 className="text-xl font-black text-white tracking-widest uppercase italic">ADMIN <span className="text-blue-500 not-italic">CENTRAL</span></h1>
          <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-600">Lodge Optical Internal</p>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border ${
                  isActive 
                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="text-emerald-500" size={12} />
            <span className="text-[10px] font-black uppercase text-slate-400">Secure Node</span>
          </div>
          <button className="text-[9px] font-bold text-slate-600 hover:text-red-400 transition-colors uppercase tracking-widest">
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 bg-[#020617]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
