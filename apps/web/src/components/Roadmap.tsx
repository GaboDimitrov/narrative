'use client';

import { motion } from 'framer-motion';

const phases = [
  {
    phase: 'MVP - Now',
    title: 'Voice Cloning & Playback',
    items: [
      'Voice cloning from 30-second sample',
      'Curated story library',
      'Mobile app with seamless playback',
      'Progress sync across devices',
    ],
    status: 'current',
  },
  {
    phase: 'Phase 2',
    title: 'Enhanced Experience',
    items: [
      'Background music & sound effects',
      'Multiple voice profiles per family',
      'Offline downloads',
      'Sleep timer & bedtime mode',
    ],
    status: 'next',
  },
  {
    phase: 'Phase 3',
    title: 'Family Features',
    items: [
      'Family sharing & invites',
      'Custom story uploads',
      'Interactive story choices',
      'AI-generated illustrations',
    ],
    status: 'future',
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-32 bg-night-blue/30 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sparkle-gold/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-copper/10 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="badge-magic uppercase tracking-wider mb-4 inline-block">
            Roadmap
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-moon-white mt-4">
            Our Journey
          </h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Building the future of bedtime stories, one feature at a time
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                  phase.status === 'current'
                    ? 'bg-gradient-to-b from-sparkle-gold/10 to-deep-violet border-sparkle-gold shadow-glow-gold'
                    : 'bg-deep-violet border-fairy hover:border-fairy-medium'
                }`}
              >
                {phase.status === 'current' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-sparkle-gold to-warm-glow text-midnight">
                    In Progress
                  </div>
                )}
                
                <div className="mb-6">
                  <div className={`text-sm font-semibold mb-2 ${
                    phase.status === 'current' ? 'text-sparkle-gold' : 'text-mauve-muted'
                  }`}>
                    {phase.phase}
                  </div>
                  <h3 className="font-display text-xl font-bold text-moon-white">{phase.title}</h3>
                </div>

                <ul className="space-y-3">
                  {phase.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span className={`mt-0.5 ${
                        phase.status === 'current' ? 'text-sparkle-gold' : 'text-mauve-muted'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-secondary">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
