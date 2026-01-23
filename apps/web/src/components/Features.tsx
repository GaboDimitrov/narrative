'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: 'Voice Cloning',
    description: 'Create a perfect AI clone of your voice from just 30 seconds of audio. Natural, warm, and unmistakably you.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    gradient: 'from-sparkle-gold to-warm-glow',
  },
  {
    title: 'Story Library',
    description: "Hundreds of bedtime classics, adventures, and educational tales. New stories added every week.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: 'from-enchanted-blue to-enchanted-blue/70',
  },
  {
    title: 'Bedtime Mode',
    description: 'Gentle volume fade, warm colors, and sleep timers. Designed to help little ones drift off peacefully.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    gradient: 'from-fog-purple to-mauve-muted',
  },
  {
    title: 'Multi-Device Sync',
    description: 'Start on your phone, continue on a tablet. Progress syncs seamlessly across all your devices.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-amber-copper to-candle-brown',
  },
  {
    title: 'Offline Mode',
    description: 'Download stories for offline listening. Perfect for car rides, flights, and anywhere without WiFi.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    gradient: 'from-warm-glow to-fairy-gold',
  },
  {
    title: 'Family Sharing',
    description: 'Share your voice with grandparents, aunts, uncles. Build a family of storytellers.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradient: 'from-enchanted-blue to-sparkle-gold',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 bg-deep-violet relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-sparkle-gold/5 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="badge-magic uppercase tracking-wider mb-4 inline-block">
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-moon-white mt-4">
            Everything You Need
          </h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Built with love for busy parents who want to stay connected with their children through the magic of storytelling.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-midnight/50 border border-fairy hover:border-fairy-medium transition-all duration-300 hover:-translate-y-1"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sparkle-gold/0 to-sparkle-gold/0 group-hover:from-sparkle-gold/5 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 text-midnight group-hover:shadow-glow-gold transition-shadow duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-moon-white group-hover:text-fairy-gold transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
