import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { ClinicalEmitter } from '@shared/services/emitter';

export function VerifyLink() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const performVerification = async () => {
      // 1. URL Fragment Leakage Protection (# instead of ?)
      // Extracts token from #token=ID.SECRET
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        return;
      }

      // 2. Harden Magic Link Verification
      const result = await api.verifyMagicLink(token);
      
      if (result.success) {
        setStatus('success');
        ClinicalEmitter.emit('magic_link_verified', { tokenID: token.split('.')[0] });
        // Simulate session rotation & cookie drop
        setTimeout(() => {
          navigate(result.role === 'doctor' ? '/portal/doctor' : '/portal/patient');
        }, 2000);
      } else {
        setStatus('error');
        ClinicalEmitter.emit('magic_link_failed', { reason: 'invalid_token' });
      }
    };

    performVerification();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full dark-glass p-12 rounded-[2.5rem] border border-white/10 text-center relative overflow-hidden">
        
        {/* Verification Animation */}
        <div className="relative z-10">
          {status === 'verifying' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2 tracking-tight">Verifying Identity</h2>
                <p className="text-slate-400 font-medium">Communicating with Clinical Data Vault...</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2 tracking-tight text-white">Identity Confirmed</h2>
                <p className="text-slate-400 font-medium mb-10">Initializing secure patient environment...</p>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2 tracking-tight text-white">Verification Failed</h2>
                <p className="text-slate-400 font-medium mb-10">This Magic Link is invalid or has expired.</p>
                <button 
                  onClick={() => navigate('/portal')}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 transition-all flex items-center justify-center gap-3"
                >
                  Request New Link <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Audit Log Hint */}
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">Forensic Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
