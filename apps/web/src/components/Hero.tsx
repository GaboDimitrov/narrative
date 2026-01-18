'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax transforms for each orb - different speeds for depth effect
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const orb1X = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const orb1Scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const orb2X = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orb2Scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const orb3X = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const orb3Scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  
  // Rotate effect for subtle movement
  const orb1Rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const orb2Rotate = useTransform(scrollYProgress, [0, 1], [0, -20]);
  
  // Content parallax - slower speed for content to move with page feel
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.3]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-dark-bg min-h-screen flex items-center pt-20">
      {/* Background gradient orbs with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl"
          style={{ y: orb1Y, x: orb1X, scale: orb1Scale, rotate: orb1Rotate }}
        />
        <motion.div 
          className="absolute top-1/3 right-0 w-80 h-80 bg-accent-pink/10 rounded-full blur-3xl"
          style={{ y: orb2Y, x: orb2X, scale: orb2Scale, rotate: orb2Rotate }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl"
          style={{ y: orb3Y, x: orb3X, scale: orb3Scale }}
        />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60" />
      
      <motion.div 
        className="container mx-auto px-4 py-24 md:py-32 relative z-10"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Logo */}
          <motion.div 
            className="mb-4 relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Glow effect behind logo */}
            <div className="absolute w-80 h-80 md:w-[28rem] md:h-[28rem] blur-[100px] bg-gradient-to-r from-primary-500/20 via-accent-pink/15 to-primary-400/20 rounded-full animate-pulse" />
            <motion.img 
              src="/logo.png" 
              alt="Narrative" 
              className="relative w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]"
              animate={{ 
                y: [0, -12, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>
        
          {/* Main heading */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-primary-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Immersive Audiobooks
          </motion.h1>
          
          {/* Subheading */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Experience stories like never before with multi-character AI voices, 
            immersive soundtracks, and cinematic production quality.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <a
              href="#waitlist"
              className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              Join Waitlist
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg bg-dark-card border border-dark-border text-gray-300 hover:border-primary-500 hover:text-white transition-all duration-300"
            >
              Learn More
            </a>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="p-6 rounded-2xl bg-dark-card/50 border border-dark-border/50 backdrop-blur-sm hover:border-primary-500/50 transition-colors duration-300">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-300">10+</div>
              <div className="text-sm text-gray-500 mt-2">Voice Characters</div>
            </div>
            <div className="p-6 rounded-2xl bg-dark-card/50 border border-dark-border/50 backdrop-blur-sm hover:border-primary-500/50 transition-colors duration-300">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-pink">1000s</div>
              <div className="text-sm text-gray-500 mt-2">Stories Coming</div>
            </div>
            <div className="p-6 rounded-2xl bg-dark-card/50 border border-dark-border/50 backdrop-blur-sm hover:border-primary-500/50 transition-colors duration-300">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-pink to-primary-400">4K</div>
              <div className="text-sm text-gray-500 mt-2">Audio Quality</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-bg to-transparent" />
    </section>
  );
}
