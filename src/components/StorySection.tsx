/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface StorySectionProps {
  title: string;
  content: string;
  image: string;
  reverse?: boolean;
}

export default function StorySection({ title, content, image, reverse = false }: StorySectionProps) {
  return (
    <section className={`py-16 md:py-24 ${reverse ? 'bg-bg-light-gray' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col md:flex-row items-center gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
          <motion.div
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2"
          >
            <div className="relative group">
              <img
                src={image}
                alt={title}
                className="w-full h-[400px] md:h-[500px] object-cover rounded-sm shadow-xl transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-4 border-primary-blue/20 -m-4 -z-10 transition-all duration-500 group-hover:-m-6"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-primary-blue mb-6 leading-tight">
              {title}
            </h2>
            <div className="w-20 h-1 bg-accent-gold mb-8"></div>
            <p className="text-text-gray text-lg leading-relaxed mb-8 font-light">
              {content}
            </p>
            <Link to="/about" className="button inline-block bg-primary-blue text-white px-8 py-3 rounded-sm text-sm font-bold tracking-widest hover:bg-accent-gold transition-all">
              Learn More
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
