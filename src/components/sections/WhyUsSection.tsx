import { motion } from 'motion/react';
import { SectionHeader } from '../patterns/SectionHeader';

interface Pillar {
  title?: string;
  description: string;
}

interface WhyUsContent {
  title: string;
  intro?: string;
  pillars: Pillar[];
  closing?: string;
}

export function WhyUsSection({ content }: { content: WhyUsContent }) {
  return (
    <section className="py-24 md:py-32 mesh-bg relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader title={content.title} subtitle={content.intro} size="sm" />
        </motion.div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.pillars.map((pillar, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-10 glass-panel rounded-3xl hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {pillar.title && <h3 className="text-2xl font-bold text-slate-900 mb-4">{pillar.title}</h3>}
              <p className="text-xl text-slate-700 leading-relaxed font-medium">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        {content.closing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 text-center"
          >
            <p className="text-xl md:text-2xl font-bold text-slate-800 glass-panel inline-block px-12 py-6 rounded-full">
              {content.closing}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
