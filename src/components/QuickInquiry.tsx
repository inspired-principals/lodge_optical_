/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function QuickInquiry() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', inquiryType: 'General Question' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setStatus('submitting');
    try {
      await api.submitContactForm(formData);
      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        setFormData({ name: '', email: '', phone: '', message: '', inquiryType: 'General Question' });
      }, 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      setEmailError('');
    }
  };

  useEffect(() => {
    const applyPrefill = (detail?: Partial<typeof formData> & { openPanel?: boolean }) => {
      if (!detail) return;
      setFormData((prev) => ({
        ...prev,
        name: detail.name ?? prev.name,
        email: detail.email ?? prev.email,
        phone: detail.phone ?? prev.phone,
        message: detail.message ?? prev.message,
        inquiryType: detail.inquiryType ?? prev.inquiryType,
      }));
      setIsOpen(detail.openPanel ?? true);
    };

    const stored = localStorage.getItem('lodge_assistant_prefill');
    if (stored) {
      try {
        applyPrefill(JSON.parse(stored));
      } catch {
        // ignore malformed saved assistant payload
      }
    }

    const handler = ((event: Event) => {
      applyPrefill((event as CustomEvent<any>).detail);
    }) as EventListener;

    window.addEventListener('lodge-assistant-prefill', handler);
    return () => window.removeEventListener('lodge-assistant-prefill', handler);
  }, []);

  return (
    <div className="fixed left-0 top-24 z-[9999] flex items-start md:top-1/3">
      {/* Tab */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ transform: isOpen ? 'translateX(min(88vw, 320px))' : 'translateX(0)' }}
        className="relative z-10 flex h-32 w-10 cursor-pointer items-center justify-center rounded-r-2xl border border-l-0 border-white/10 bg-slate-950/95 text-white shadow-[0_15px_35px_rgba(15,23,42,0.35)] backdrop-blur-md transition-transform duration-300 md:h-36 md:w-11"
      >
        <span className="py-3 text-[10px] font-bold uppercase tracking-[0.28em] [writing-mode:vertical-rl] rotate-180 sm:text-xs">
          Quick Inquiry
        </span>
      </button>

      {/* Form Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 22, stiffness: 120 }}
            className="absolute left-0 top-0 max-h-[calc(100vh-7rem)] w-[min(88vw,320px)] overflow-y-auto rounded-r-[1.5rem] border-2 border-slate-900/80 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.24)] sm:p-5 md:max-h-[calc(100vh-5rem)] md:p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold tracking-wide text-slate-900">Quick Inquiry</h3>
              <button onClick={() => setIsOpen(false)} className="text-primary-blue hover:text-accent-gold transition-colors">
                <X size={20} />
              </button>
            </div>
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
                <CheckCircle2 size={48} className="text-green-500" />
                <p className="text-primary-blue font-bold">Message sent!</p>
                <p className="text-sm text-text-gray">We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name*"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-premium"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">Please enter your full name.</p>
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email ID*"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-premium ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                  />
                  {emailError ? (
                    <p className="text-red-500 text-[10px] mt-1">{emailError}</p>
                  ) : (
                    <p className="text-[10px] text-gray-500 mt-1">We'll use this to reply to your inquiry.</p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone*"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-premium"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">Best number for a quick callback.</p>
                </div>

                <div>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    <option value="General Question">General Question</option>
                    <option value="Appointment">Appointment</option>
                    <option value="Callback Request">Callback Request</option>
                    <option value="Digital Triage Help">Digital Triage Help</option>
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">Select the most relevant category for your request.</p>
                </div>

                <div>
                  <textarea
                    name="message"
                    placeholder="Message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    className="input-premium resize-none"
                  ></textarea>
                  <p className="text-[10px] text-gray-600 mt-1">Provide any additional details (optional).</p>
                </div>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full rounded-lg bg-slate-950 text-white py-3 font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {status === 'submitting' ? <Loader2 className="animate-spin" size={18} /> : 'Submit'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
