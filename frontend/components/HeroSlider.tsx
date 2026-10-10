import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { DEFAULT_HERO_SLIDES, HeroSlide } from '../data/homeContent';

const SLIDE_DURATION = 6000;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const textVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.25 + i * 0.15, ease: EASE },
  }),
};

interface HeroSliderProps {
  slides?: HeroSlide[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides = DEFAULT_HERO_SLIDES }) => {
  const SLIDES = slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => window.clearInterval(timer);
  }, []);

  const slide = SLIDES[index] ?? SLIDES[0];

  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-brand-dark" aria-label="Featured offers">
      {/* Sliding / fading background with slow Ken Burns zoom */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover animate-ken-burns"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Slide content */}
      <div className="relative z-10 h-full container mx-auto px-5 sm:px-8 lg:px-12 flex items-center">
        <div className="max-w-2xl text-white">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}>
              <motion.p
                custom={0}
                variants={textVariants}
                className="inline-flex items-center gap-2 text-brand-accent font-semibold tracking-[0.25em] uppercase text-xs sm:text-sm mb-4"
              >
                <span className="h-px w-8 bg-brand-accent inline-block" />
                {slide.kicker}
              </motion.p>
              <motion.h1
                custom={1}
                variants={textVariants}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-5"
              >
                {slide.title}
              </motion.h1>
              <motion.p custom={2} variants={textVariants} className="text-base sm:text-lg md:text-xl text-white/80 mb-8">
                {slide.subtitle}
              </motion.p>
              <motion.div custom={3} variants={textVariants} className="flex flex-wrap items-center gap-4">
                <Link to={slide.link}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="group inline-flex items-center gap-2 bg-brand-accent text-white font-semibold py-3.5 px-8 rounded-full text-base sm:text-lg shadow-lift hover:bg-brand-accent-dark transition-colors"
                  >
                    {slide.cta}
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </Link>
                <Link
                  to="/collection"
                  className="text-white/80 hover:text-white font-medium underline-offset-8 underline decoration-white/30 hover:decoration-brand-accent transition-colors"
                >
                  View all products
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Arrows */}
      <div className="absolute z-20 bottom-6 right-5 sm:right-8 flex items-center gap-2">
        <button
          onClick={() => goTo(index - 1)}
          aria-label="Previous slide"
          className="p-2.5 rounded-full border border-white/30 text-white/80 hover:bg-white hover:text-brand-dark transition-all active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => goTo(index + 1)}
          aria-label="Next slide"
          className="p-2.5 rounded-full border border-white/30 text-white/80 hover:bg-white hover:text-brand-dark transition-all active:scale-90"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="absolute z-20 bottom-7 left-5 sm:left-8 lg:left-12 flex items-center gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? 'w-10 bg-brand-accent' : 'w-4 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
