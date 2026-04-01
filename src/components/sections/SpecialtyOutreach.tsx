import { motion } from 'motion/react';
import { SectionHeader } from '../patterns/SectionHeader';

interface Initiative {
  title: string;
  description: string;
  image: string;
}

interface SpecialtyOutreachProps {
  content: {
    sectionTitle: string;
    initiatives: Initiative[];
  };
}

export function SpecialtyOutreach({ content }: SpecialtyOutreachProps) {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionHeader title={content.sectionTitle} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {content.initiatives.map((initiative, index) => (
            <motion.div
              key={initiative.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={initiative.image} 
                  alt={initiative.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-blue-900/10" />
              </div>
              <div className="p-10 flex-grow">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{initiative.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  {initiative.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
