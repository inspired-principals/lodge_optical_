import { motion } from 'motion/react';
import { SectionHeader } from '../patterns/SectionHeader';

interface ImageFeatureContent {
  title: string;
  subtitle?: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  bullets?: string[];
}

export function ImageFeature({ content }: { content: ImageFeatureContent }) {
  const isRight = content.imagePosition === 'right';

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${isRight ? 'lg:flex-row-reverse' : ''}`}>
          
          <motion.div 
            initial={{ opacity: 0, x: isRight ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.12)] group border-[8px] border-slate-50/50">
              <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
              <img 
                src={content.imageSrc} 
                alt={content.imageAlt} 
                className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: isRight ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-1/2"
          >
            <SectionHeader title={content.title} subtitle={content.subtitle} />
            <p className="text-xl text-slate-600 leading-relaxed font-medium mb-8">
              {content.description}
            </p>
            {content.bullets && (
              <ul className="space-y-4">
                {content.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2.5 mr-4 flex-shrink-0" />
                    <span className="text-lg text-slate-800 font-bold">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
