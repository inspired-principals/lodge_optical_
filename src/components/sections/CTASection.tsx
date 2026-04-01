import { motion } from 'motion/react';
import { PrimaryCTA } from '../patterns/PrimaryCTA';
import { ShieldAlert } from 'lucide-react';

interface CTAContent {
  headline: string;
  subheadline?: string;
  primaryButtonText: string;
  buttonLink: string;
  supportText?: string;
  trustNudge?: string;
}

export function CTASection({ content }: { content: CTAContent }) {
  return (
    <section className="relative py-28 md:py-40 hero-gradient border-t border-slate-800 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="dark-glass p-12 md:p-16 rounded-[3rem]"
        >
          {content.trustNudge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{content.trustNudge}</span>
            </div>
          )}
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gradient-dark tracking-tight mb-6 leading-tight pb-2">
            {content.headline}
          </h2>
          {content.subheadline && (
            <p className="text-xl md:text-2xl text-slate-300 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              {content.subheadline}
            </p>
          )}
          
          <div className="flex flex-col items-center pt-4">
            <PrimaryCTA text={content.primaryButtonText} link={content.buttonLink} />
            {content.supportText && (
              <p className="mt-8 text-sm font-semibold tracking-widest uppercase text-slate-400 opacity-80">
                {content.supportText}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
