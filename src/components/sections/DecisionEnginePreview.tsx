import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../patterns/SectionHeader';

interface Option {
  label: string;
  subtext: string;
  href: string;
}

interface DecisionContent {
  title: string;
  description: string;
  options: Option[];
}

export function DecisionEnginePreview({ content }: { content: DecisionContent }) {
  return (
    <section className="py-24 md:py-32 mesh-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <SectionHeader title={content.title} subtitle={content.description} />
        </motion.div>
        
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {content.options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
              className="h-full"
            >
              <Link 
                to={option.href} 
                className="group flex flex-col h-full p-10 glass-panel hover:bg-white/95 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-blue-200/60 rounded-3xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110 pointer-events-none" />
                
                <h3 className="text-3xl font-extrabold text-slate-900 mb-5 group-hover:text-blue-700 transition-colors drop-shadow-sm">
                  {option.label}
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed flex-grow font-medium">
                  {option.subtext}
                </p>
                <div className="mt-10 flex items-center text-blue-700 font-bold tracking-wide uppercase text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>Explore Solution</span>
                  <ArrowRight className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
