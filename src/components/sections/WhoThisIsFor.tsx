import { motion } from 'motion/react';
import { SectionHeader } from '../patterns/SectionHeader';

interface WhoThisIsForProps {
  content: {
    sectionTitle: string;
    leadIn?: string;
    indicators: string[];
    closing?: string;
  };
}

export function WhoThisIsFor({ content }: WhoThisIsForProps) {
  return (
    <section className="py-24 md:py-32 mesh-bg relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader title={content.sectionTitle} subtitle={content.leadIn} />
        </motion.div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.indicators.map((indicator, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start p-8 glass-panel rounded-3xl transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-3 h-3 rounded-full bg-blue-600 mt-2 mr-5 flex-shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.6)]" />
              <span className="text-xl text-slate-800 font-medium leading-relaxed">{indicator}</span>
            </motion.div>
          ))}
        </div>

        {content.closing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 p-8 glass-panel rounded-3xl text-center"
          >
            <p className="text-2xl font-bold text-gradient">{content.closing}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
