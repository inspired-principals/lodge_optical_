/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { heroContent } from '../content/homeContent';

const slides = [
  {
    id: 1,
    image: '/images/hero1.svg',
    title: heroContent.headline,
    subtitle: heroContent.subheadline,
    mechanism: heroContent.mechanism,
    outcomes: heroContent.outcomes,
    cta: heroContent.cta,
    ctaLink: heroContent.link,
    ctaSecondary: heroContent.ctaSecondary,
    ctaLinkSecondary: heroContent.linkSecondary,
  },
  {
    id: 2,
    image: '/images/hero2.svg',
    title: 'Designer Frames',
    subtitle: 'Discover the perfect look with our exclusive collection.',
    cta: 'Our Services',
    ctaLink: '/services',
    ctaSecondary: 'Contact Us',
    ctaLinkSecondary: '/contact',
  },
  {
    id: 3,
    image: '/images/hero3.svg',
    title: 'Advanced Technology',
    subtitle: 'State-of-the-art diagnostic equipment for accurate results.',
    cta: 'Our Services',
    ctaLink: '/services',
    ctaSecondary: 'Contact Us',
    ctaLinkSecondary: '/contact',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-primary-blue">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/80 to-transparent flex items-center">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="max-w-2xl text-white"
              >
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none mb-4">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-lg md:text-xl font-light tracking-wide mb-6 opacity-90">
                  {slides[currentSlide].subtitle}
                </p>
                {slides[currentSlide].mechanism && (
                  <p className="text-base md:text-lg font-light tracking-wide mb-8 opacity-85 italic border-l-2 border-white/40 pl-4">
                    {slides[currentSlide].mechanism}
                  </p>
                )}
                {slides[currentSlide].outcomes && (
                  <div className="mb-8 space-y-2">
                    {slides[currentSlide].outcomes.map((outcome: string, idx: number) => (
                      <p key={idx} className="text-sm md:text-base font-light opacity-90 flex items-start gap-3">
                        <span className="text-white/60 mt-1">•</span>
                        <span>{outcome}</span>
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 flex-wrap">
                  <Link to={slides[currentSlide].ctaLink} 
                    className="px-8 py-3 bg-white text-primary-blue font-bold rounded-full 
                    shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    {slides[currentSlide].cta}
                  </Link>
                  <Link to={slides[currentSlide].ctaLinkSecondary} 
                    className="px-8 py-3 border-2 border-white bg-transparent text-white font-bold rounded-full 
                    hover:bg-white hover:text-primary-blue hover:shadow-lg transition-all duration-200"
                  >
                    {slides[currentSlide].ctaSecondary}
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 right-10 flex gap-4 z-20">
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-primary-blue transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-primary-blue transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-10 flex gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-12 h-1 transition-all duration-300 ${idx === currentSlide ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </section>
  );
}
