'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const carouselSlides = [
  {
    title: 'Immersive ',
    titleLine2: 'Audiobooks',
    subtitle: 'Experience stories like never before with multi-character AI voices, immersive soundtracks, and cinematic production quality.',
  },
  {
    title: 'Your Voice',
    titleLine2: 'Their Dreams',
    subtitle: 'Join thousands of parents who want to stay connected with their children through the magic of storytelling.',
  },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax transforms for each orb
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const orb1X = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const orb1Scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const orb2X = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orb2Scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const orb3X = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const orb3Scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  
  const orb1Rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const orb2Rotate = useTransform(scrollYProgress, [0, 1], [0, -20]);
  
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.3]);

  // Client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-rotate carousel disabled - manual navigation only
  // useEffect(() => {
  //   if (!isClient) return;
  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, [isClient]);

  const slide = carouselSlides[currentSlide];

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-dark-bg h-screen flex items-center justify-center">
      {/* Background gradient orbs with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 -left-1/4 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl"
          style={{ y: orb1Y, x: orb1X, scale: orb1Scale, rotate: orb1Rotate }}
        />
        <motion.div 
          className="absolute top-1/3 right-0 w-72 h-72 bg-accent-pink/10 rounded-full blur-3xl"
          style={{ y: orb2Y, x: orb2X, scale: orb2Scale, rotate: orb2Rotate }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/3 w-64 h-64 bg-primary-500/15 rounded-full blur-3xl"
          style={{ y: orb3Y, x: orb3X, scale: orb3Scale }}
        />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60" />
      
      <motion.div 
        className="container mx-auto px-4 relative z-10"
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
            <div className="absolute w-40 h-40 md:w-56 md:h-56 blur-[60px] bg-gradient-to-r from-primary-500/20 via-accent-pink/15 to-primary-400/20 rounded-full animate-pulse" />
            <motion.img 
              src="/logo.png" 
              alt="Narrative" 
              className="relative w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]"
              animate={{ 
                y: [0, -6, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>
        
          {/* Carousel Content */}
          <div className="min-h-[140px] md:min-h-[160px] flex flex-col items-center justify-center mb-4">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Main heading */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 text-white">
                {slide.title}
                {slide.titleLine2 && (
                  <>
                    <br />
                    <span className="text-primary-400">
                      {slide.titleLine2}
                    </span>
                  </>
                )}
              </h1>
              
              {/* Subheading */}
              <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                {slide.subtitle}
              </p>
            </motion.div>
          </div>

          {/* Carousel Navigation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Left Arrow */}
            <button
              onClick={goToPrevSlide}
              className="w-10 h-10 rounded-full border border-dark-border bg-dark-card/50 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500 hover:bg-dark-card transition-all duration-300"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="flex gap-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 bg-primary-500' 
                      : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={goToNextSlide}
              className="w-10 h-10 rounded-full border border-dark-border bg-dark-card/50 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500 hover:bg-dark-card transition-all duration-300"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 justify-center"
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
        </div>
      </motion.div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-dark-bg to-transparent" />
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 border-gray-600 flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
