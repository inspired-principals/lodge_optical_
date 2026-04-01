import { motion } from 'motion/react';
import { SectionHeader } from '../patterns/SectionHeader';

interface ProcessStepData {
  title: string;
  description: string;
}

interface ProcessSectionProps {
  content: {
    sectionTitle: string;
    leadIn?: string;
    steps: ProcessStepData[];
    closingLine?: string;
  };
}

export function ProcessSection({ content }: ProcessSectionProps) {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader title={content.sectionTitle} subtitle={content.leadIn} />
        </motion.div>
        
        <div className="mt-16 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gradient-to-b from-blue-600 via-blue-300 to-transparent rounded-full opacity-20 hidden md:block" />

          <div className="space-y-12">
            {content.steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col md:flex-row relative group"
              >
                <div className="w-14 h-14 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center font-bold text-xl text-blue-600 flex-shrink-0 z-10 shadow-sm group-hover:border-blue-600 group-hover:text-blue-700 transition-colors duration-300 mb-6 md:mb-0">
                  {index + 1}
                </div>
                <div className="md:ml-8 glass-panel p-8 md:p-10 rounded-3xl flex-grow group-hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {content.closingLine && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 p-10 glass-panel border-blue-100 bg-blue-50/50 rounded-3xl"
          >
            <p className="text-xl md:text-2xl font-bold text-slate-800 text-center tracking-tight">
              {content.closingLine}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
