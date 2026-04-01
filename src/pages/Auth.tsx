import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, CheckCircle2, User, Stethoscope } from 'lucide-react';
import { trackEvent } from '../utils/events';

export default function Auth() {
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !identifier) return;
    
    setStatus('submitting');
    trackEvent('magic_link_requested', { role, identifier });
    
    // Mocking an API call
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-24 bg-slate-50">
      <div className="w-full max-w-md px-4 sm:px-6">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Secure Portal Access</h1>
          <p className="text-lg text-slate-600">Request a secure, passwordless magic link to instantly access your dashboard.</p>
        </div>

        <div className="bg-white p-8 md:p-10 border border-slate-200 rounded-3xl shadow-sm">
          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Link Dispatched</h2>
              <p className="text-lg text-slate-600 mb-8">We've securely dispatched a magic link to your contact on file. Click it to instantly access your portal.</p>
              <button 
                onClick={() => { setStatus('idle'); setIdentifier(''); setRole(null); }}
                className="text-blue-600 font-bold tracking-widest uppercase text-sm hover:text-blue-800 transition-colors"
              >
                Request another link
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-4">
                <label className="block text-sm font-bold uppercase tracking-widest text-slate-500">I am a...</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                      role === 'patient' 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-8 h-8 mb-3" />
                    <span className="font-semibold">Patient</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                      role === 'doctor' 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Stethoscope className="w-8 h-8 mb-3" />
                    <span className="font-semibold">Referring Clinic</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold uppercase tracking-widest text-slate-500">Account Verified Email or Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-lg"
                    placeholder="Enter email or phone number" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!role || !identifier || status === 'submitting'}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {status === 'submitting' ? 'Verifying Identity...' : 'Send Magic Link'}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
