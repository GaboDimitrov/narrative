'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const MicIcon = () => (
  <svg className="w-8 h-8 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const WandIcon = () => (
  <svg className="w-8 h-8 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg className="w-8 h-8 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-8 h-8 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const steps = [
  {
    number: '01',
    icon: MicIcon,
    title: 'Record Your Voice',
    description: "Just 30 seconds of natural speech. Read a few sentences—that's all we need to capture your unique voice.",
  },
  {
    number: '02',
    icon: WandIcon,
    title: 'AI Creates Your Clone',
    description: 'Our advanced AI builds a voice model that sounds just like you. Warm, natural, and unmistakably yours.',
  },
  {
    number: '03',
    icon: HeadphonesIcon,
    title: 'Choose Any Story',
    description: 'Browse our library of bedtime classics, adventures, and educational tales. Select one and hit play.',
  },
  {
    number: '04',
    icon: HeartIcon,
    title: 'They Hear You',
    description: "Your child drifts off to sleep hearing your voice, feeling your presence—even when you're traveling for work.",
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ['0%', '100%']);

  return (
    <section id="how-it-works" ref={containerRef} className="py-32 relative overflow-hidden bg-midnight">
      {/* Background accents */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-enchanted-blue/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] bg-amber-copper/10 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="badge-magic uppercase tracking-wider mb-4 inline-block">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-moon-white mt-4 mb-6">
            From Your Voice
            <br />
            <span className="bg-gradient-to-r from-sparkle-gold to-fairy-gold bg-clip-text text-transparent">
              To Their Dreams
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto relative">
          {/* Progress Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-night-blue -translate-x-1/2 hidden md:block">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full bg-gradient-to-b from-sparkle-gold via-warm-glow to-fairy-gold origin-top"
            />
          </div>

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div 
                      className={`rounded-2xl p-8 inline-block bg-deep-violet/80 border border-fairy backdrop-blur-sm hover:border-fairy-medium transition-all duration-300 ${
                        isEven ? 'md:mr-8' : 'md:ml-8'
                      }`}
                    >
                      <span className="text-5xl font-display font-bold text-sparkle-gold/20">
                        {step.number}
                      </span>
                      <h3 className="font-display text-2xl font-bold text-moon-white mt-2 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-secondary max-w-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="relative hidden md:block">
                    <div className="absolute inset-0 bg-sparkle-gold/30 rounded-2xl blur-xl" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sparkle-gold to-warm-glow flex items-center justify-center shadow-glow-gold z-10 relative">
                      <Icon />
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
