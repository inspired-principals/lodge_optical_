import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ClinicalEmitter } from '@shared/services/emitter';

export function MagicLinkRequest() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugUrl, setDebugUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 1. Harden Magic Link Process
    ClinicalEmitter.emit('magic_link_requested', { email });
    const result = await api.requestMagicLink(email);
    
    setIsLoading(false);
    if (result.success) {
      setIsSuccess(true);
      setDebugUrl(result.debug_url);
      ClinicalEmitter.emit('magic_link_sent', { email });
    } else {
      ClinicalEmitter.emit('magic_link_failed', { email, reason: 'api_error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between backdrop-blur-3xl bg-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Patient <span className="text-blue-500">Vault</span></h1>
        </div>
        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">
          Exit to Site
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Minimal Background Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-blue-500/5 blur-[120px] rounded-full" />
        
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="request"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full dark-glass p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative z-10 shadow-3xl"
            >
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Secure Access</h2>
              <p className="text-sm text-slate-400 mb-10 leading-relaxed">
                Enter your email address to access your clinical records and specialty lens fit data.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="Identified Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full h-16 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-black tracking-widest uppercase flex items-center justify-between px-8 transition-all group disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying...' : 'Request Magic Link'}</span>
                  {!isLoading && <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full dark-glass p-12 rounded-[2.5rem] text-center relative z-10"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <Mail className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Link Sent</h2>
              <p className="text-slate-300 mb-10 leading-relaxed">
                A secure login link has been dispatched to <strong className="text-white">{email}</strong>.
              </p>
              
              <div className="flex flex-col gap-3">
                <Link to="/portal/patient" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                  Proceed to Dashboard (Demo)
                </Link>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-4 hover:text-white transition-opacity"
                >
                  Try Different Email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="px-8 py-8 flex items-center justify-center border-t border-white/5 opacity-40">
         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Clinical Data Sandbox Active</span>
      </footer>
    </div>
  );
}
