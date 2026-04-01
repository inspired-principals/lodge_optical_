import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, ChevronRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ExitIntentOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isVisible && !hasDismissed) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isVisible, hasDismissed]);

  if (hasDismissed && !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsVisible(false); setHasDismissed(true); }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="max-w-xl w-full dark-glass p-8 md:p-12 rounded-[3rem] relative z-10 text-center"
          >
            <button 
              onClick={() => { setIsVisible(false); setHasDismissed(true); }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-8">
              <Activity className="w-10 h-10 text-blue-400" />
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Before You Go — Let’s Point You in the Right Direction</h2>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed">
              If your vision is still unstable, uncomfortable, or unresolved, our 3-minute digital triage can help clarify the next best step.
            </p>

            <div className="flex flex-col gap-4">
              <Link 
                to="/triage" 
                onClick={() => setIsVisible(false)}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black tracking-widest uppercase transition-all shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-between px-10 group"
              >
                <span>Start Digital Triage</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mt-4">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Zero Obligation Clinical Pre-Screen</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
