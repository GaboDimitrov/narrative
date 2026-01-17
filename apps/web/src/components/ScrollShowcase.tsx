'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Fairy tale characters for the orbiting display
const characters = [
  { name: 'Red Riding Hood', emoji: '🧒', color: 'from-red-500 to-red-700', image: '/characters/red-riding-hood.png' },
  { name: 'The Wolf', emoji: '🐺', color: 'from-gray-600 to-gray-800', image: '/characters/wolf.png' },
  { name: 'Cinderella', emoji: '👸', color: 'from-blue-400 to-blue-600', image: '/characters/cinderella.png' },
  { name: 'The Prince', emoji: '🤴', color: 'from-purple-500 to-purple-700', image: '/characters/prince.png' },
  { name: 'Rapunzel', emoji: '👩‍🦳', color: 'from-yellow-400 to-amber-500', image: '/characters/rapunzel.png' },
  { name: 'The Witch', emoji: '🧙‍♀️', color: 'from-green-600 to-green-800', image: '/characters/witch.png' },
  { name: 'Hansel', emoji: '👦', color: 'from-orange-400 to-orange-600', image: '/characters/hansel.png' },
  { name: 'Gretel', emoji: '👧', color: 'from-pink-400 to-pink-600', image: '/characters/gretel.png' },
];

// Grimm Brothers portraits
const grimmBrothers = [
  { name: 'Jacob Grimm', initials: 'JG', color: 'from-primary-600 to-primary-800' },
  { name: 'Wilhelm Grimm', initials: 'WG', color: 'from-primary-500 to-primary-700' },
];

function CharacterOrbit({ 
  character, 
  radius, 
  initialAngle, 
  scrollProgress,
  direction = 1,
  speed = 1 
}: { 
  character: typeof characters[0];
  radius: number;
  initialAngle: number;
  scrollProgress: any;
  direction?: number;
  speed?: number;
}) {
  const angle = useTransform(
    scrollProgress, 
    [0, 1], 
    [initialAngle, initialAngle + (360 * speed * direction)]
  );
  
  const x = useTransform(angle, (a) => Math.cos((a * Math.PI) / 180) * radius);
  const y = useTransform(angle, (a) => Math.sin((a * Math.PI) / 180) * radius);
  const rotate = useTransform(scrollProgress, [0, 1], [0, 360 * direction]);

  return (
    <motion.div
      style={{ x, y, rotate }}
      className="absolute"
    >
      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden group cursor-pointer`}>
        <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">
          {character.emoji}
        </span>
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-gray-400 bg-dark-card/80 px-2 py-1 rounded-full">
          {character.name}
        </span>
      </div>
    </motion.div>
  );
}

function GrimmBrotherOrbit({
  brother,
  radius,
  initialAngle,
  scrollProgress,
}: {
  brother: typeof grimmBrothers[0];
  radius: number;
  initialAngle: number;
  scrollProgress: any;
}) {
  const angle = useTransform(
    scrollProgress,
    [0, 1],
    [initialAngle, initialAngle - 180]
  );

  const x = useTransform(angle, (a) => Math.cos((a * Math.PI) / 180) * radius);
  const y = useTransform(angle, (a) => Math.sin((a * Math.PI) / 180) * radius);
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [0.8, 1.2, 1]);

  return (
    <motion.div
      style={{ x, y, scale }}
      className="absolute"
    >
      <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${brother.color} flex items-center justify-center shadow-xl border-4 border-primary-400/30 relative overflow-hidden`}>
        {/* Silhouette effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="text-2xl md:text-3xl font-bold text-white/90 relative z-10">
          {brother.initials}
        </span>
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-sm text-primary-300 font-medium">
          {brother.name}
        </span>
      </div>
    </motion.div>
  );
}

export default function ScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Background animations
  const bgRotate = useTransform(smoothProgress, [0, 1], [0, 45]);
  const centerScale = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.5, 1.1, 1.1, 0.8]);
  const opacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const titleY = useTransform(smoothProgress, [0, 0.5, 1], [50, 0, -50]);

  // Orbit ring animations
  const ring1Rotate = useTransform(smoothProgress, [0, 1], [0, 90]);
  const ring2Rotate = useTransform(smoothProgress, [0, 1], [0, -60]);
  const ring3Rotate = useTransform(smoothProgress, [0, 1], [0, 120]);

  return (
    <section 
      id="showcase"
      ref={containerRef} 
      className="relative min-h-[250vh] bg-dark-bg overflow-hidden"
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          style={{ rotate: bgRotate }}
          className="absolute inset-0 opacity-30"
        >
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-pink/20 rounded-full blur-[100px]" />
        </motion.div>

        {/* Orbit rings */}
        <motion.div 
          style={{ rotate: ring1Rotate, opacity }}
          className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-primary-500/30"
        />
        <motion.div 
          style={{ rotate: ring2Rotate, opacity }}
          className="absolute w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full border border-accent-pink/20"
        />
        <motion.div 
          style={{ rotate: ring3Rotate, opacity }}
          className="absolute w-[700px] h-[700px] md:w-[900px] md:h-[900px] rounded-full border border-primary-400/15"
        />

        {/* Orbiting characters - Inner ring */}
        {characters.slice(0, 4).map((char, i) => (
          <CharacterOrbit
            key={char.name}
            character={char}
            radius={isMobile ? 150 : 200}
            initialAngle={i * 90}
            scrollProgress={smoothProgress}
            direction={1}
            speed={1}
          />
        ))}

        {/* Orbiting characters - Outer ring (opposite direction) */}
        {characters.slice(4, 8).map((char, i) => (
          <CharacterOrbit
            key={char.name}
            character={char}
            radius={isMobile ? 250 : 325}
            initialAngle={i * 90 + 45}
            scrollProgress={smoothProgress}
            direction={-1}
            speed={0.7}
          />
        ))}

        {/* Grimm Brothers - Center orbit */}
        {grimmBrothers.map((brother, i) => (
          <GrimmBrotherOrbit
            key={brother.name}
            brother={brother}
            radius={isMobile ? 350 : 450}
            initialAngle={i * 180 + 90}
            scrollProgress={smoothProgress}
          />
        ))}

        {/* Sound wave bars - left */}
        <motion.div 
          style={{ opacity }}
          className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 flex gap-1"
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`left-${i}`}
              style={{ 
                scaleY: useTransform(smoothProgress, [0, 0.5, 1], [0.3, 1 + (i % 3) * 0.4, 0.5]),
              }}
              className="w-1 md:w-1.5 h-16 md:h-24 bg-gradient-to-t from-primary-500 to-accent-pink rounded-full origin-center"
            />
          ))}
        </motion.div>

        {/* Sound wave bars - right */}
        <motion.div 
          style={{ opacity }}
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 flex gap-1"
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`right-${i}`}
              style={{ 
                scaleY: useTransform(smoothProgress, [0, 0.5, 1], [0.5, 1 + ((5-i) % 3) * 0.4, 0.3]),
              }}
              className="w-1 md:w-1.5 h-16 md:h-24 bg-gradient-to-t from-accent-pink to-primary-500 rounded-full origin-center"
            />
          ))}
        </motion.div>

        {/* Center content - Book with glow */}
        <motion.div 
          style={{ scale: centerScale, opacity }}
          className="absolute z-20"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary-500/30 blur-3xl rounded-full scale-150" />
            
            {/* Book icon */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-2xl border border-primary-400/30">
              <span className="text-5xl md:text-6xl">📖</span>
            </div>
          </div>
        </motion.div>

        {/* Title overlay */}
        <motion.div 
          style={{ opacity, y: titleY }}
          className="absolute bottom-20 md:bottom-32 left-0 right-0 text-center px-4 z-30"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-card/80 backdrop-blur border border-dark-border mb-4">
            <span className="w-2 h-2 rounded-full bg-accent-pink animate-pulse" />
            <span className="text-sm text-primary-300">The Immersive Experience</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-accent-pink">
            Characters Come Alive
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto">
            Every character speaks with their own unique voice. 
            Step into worlds crafted by the Brothers Grimm and beyond.
          </p>
        </motion.div>

        {/* Floating particles */}
        <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              style={{
                x: useTransform(smoothProgress, [0, 1], [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 5)]),
                y: useTransform(smoothProgress, [0, 1], [0, (i % 3 === 0 ? -1 : 1) * (20 + i * 3)]),
              }}
              className="absolute w-1 h-1 bg-primary-400/50 rounded-full"
              initial={{
                left: `${10 + (i * 4.5)}%`,
                top: `${15 + (i * 4)}%`,
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
