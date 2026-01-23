'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const heroContent = {
  title: 'Every story,',
  titleHighlight: 'told in your voice.',
  subtitle: "Bedtime stories don't have to end when you're away. Narrative understands you.",
};

// Letters with their final positions (index in the word)
const NARRATIVE_LETTERS = [
  { letter: 'n', index: 0 },
  { letter: 'a', index: 1 },
  { letter: 'r', index: 2 },
  { letter: 'r', index: 3 },
  { letter: 'a', index: 4 },
  { letter: 't', index: 5 },
  { letter: 'i', index: 6 },
  { letter: 'v', index: 7 },
  { letter: 'e', index: 8 },
];

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function NarrativeText() {
  const [shuffledLetters] = useState(() => shuffleArray(NARRATIVE_LETTERS));
  const [letterSpacing] = useState(18); // pixels between letters

  return (
    <div className="relative h-10 flex items-center" style={{ width: '170px' }}>
      {shuffledLetters.map((item, animationIndex) => (
        <motion.span
          key={`${item.letter}-${item.index}`}
          className="font-display text-2xl md:text-3xl font-bold text-sparkle-gold absolute"
          style={{
            textShadow: '0 0 20px rgba(239, 200, 135, 0.5)',
            left: item.index * letterSpacing,
          }}
          initial={{ 
            opacity: 0, 
            x: 400 + Math.random() * 300,
            y: 200 + Math.random() * 150,
            rotate: -30 + Math.random() * 60,
            scale: 0.3,
          }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: 0,
            rotate: 0,
            scale: 1,
          }}
          transition={{
            duration: 15 + Math.random() * 10, // Match ScatteredLetters speed (15-25s)
            delay: 1 + animationIndex * 2,
            ease: 'easeOut',
          }}
        >
          {item.letter}
        </motion.span>
      ))}
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section 
      ref={sectionRef} 
      className="relative overflow-hidden bg-midnight h-screen flex items-start pt-32 md:pt-40"
    >
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ scale: bgScale }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/hero-bg.png)',
          }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-midnight/70 via-midnight/40 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-abyss/90" />
      </motion.div>
      
      {/* Castle floating above the book */}
      <motion.div 
        className="absolute bottom-[26rem] right-2 md:bottom-[34rem] md:right-8 lg:bottom-[28rem] lg:right-[18rem] z-8"
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.5 }}
      >
        <motion.img 
          src="/castle.png" 
          alt="Magical Castle" 
          className="w-20 md:w-28 lg:w-36 object-contain"
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 1, 0, -1, 0],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            filter: 'drop-shadow(0 0 25px rgba(239, 200, 135, 0.3))',
          }}
        />
      </motion.div>

      {/* Second castle floating to the left of the book - hidden on small screens */}
      <motion.div 
        className="hidden lg:block absolute bottom-64 right-80 md:bottom-80 md:right-[32rem] lg:bottom-96 lg:right-[42rem] z-8"
        initial={{ opacity: 0, y: 40, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.7 }}
      >
        <motion.img 
          src="/castle-2.png" 
          alt="Magical Castle" 
          className="w-24 md:w-32 lg:w-40 object-contain"
          animate={{ 
            y: [0, -6, 0],
            rotate: [0, -1, 0, 1, 0],
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            filter: 'drop-shadow(0 0 20px rgba(239, 200, 135, 0.3))',
          }}
        />
      </motion.div>

      {/* Wizard floating near the first castle */}
      <motion.div 
        className="hidden md:block absolute bottom-[22rem] right-2 md:bottom-[30rem] md:right-4 lg:bottom-[24rem] lg:right-[12rem] z-9"
        initial={{ opacity: 0, x: 30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.9 }}
      >
        <motion.img 
          src="/wizzard.png" 
          alt="Wizard" 
          className="w-16 md:w-20 lg:w-28 object-contain"
          animate={{ 
            y: [0, -5, 0],
            x: [0, 3, 0],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            filter: 'drop-shadow(0 0 15px rgba(180, 180, 220, 0.4))',
          }}
        />
      </motion.div>

      {/* Princess floating near the second castle - hidden on small screens */}
      <motion.div 
        className="hidden lg:block absolute bottom-56 right-72 md:bottom-72 md:right-[28rem] lg:bottom-[26rem] lg:right-[28rem] z-9"
        initial={{ opacity: 0, x: -30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 1.1 }}
      >
        <motion.img 
          src="/princess.png" 
          alt="Princess" 
          className="w-14 md:w-18 lg:w-24 object-contain"
          animate={{ 
            y: [0, -6, 0],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            filter: 'drop-shadow(0 0 15px rgba(100, 130, 180, 0.4))',
          }}
        />
      </motion.div>

      {/* Knight floating between castles - hidden on small screens */}
      <motion.div 
        className="hidden lg:block absolute bottom-72 right-[30rem] lg:bottom-[34rem] lg:right-[35rem] z-9"
        initial={{ opacity: 0, x: 40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1.3, delay: 1.0 }}
      >
        <motion.img 
          src="/knight.png" 
          alt="Knight" 
          className="w-20 md:w-24 lg:w-32 object-contain"
          animate={{ 
            y: [0, -8, 0],
            x: [0, 5, 0, -5, 0],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            filter: 'drop-shadow(0 0 15px rgba(180, 180, 200, 0.4))',
          }}
        />
      </motion.div>

      {/* Talk bubble floating on top of book */}
      <motion.div 
        className="absolute bottom-72 right-16 md:bottom-94 md:right-24 lg:bottom-[23rem] lg:right-[32rem] z-12"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <motion.img 
          src="/talk-bubble.png" 
          alt="Speech Bubble" 
          className="w-8 md:w-10 lg:w-12 object-contain"
          animate={{ 
            y: [0, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            filter: 'drop-shadow(0 0 15px rgba(239, 200, 135, 0.4))',
          }}
        />
      </motion.div>

      {/* Magical Book at bottom right - bigger and moved up/left */}
      <motion.div 
        className="absolute bottom-32 right-32 md:bottom-40 md:right-48 lg:right-56 z-10"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <motion.img 
          src="/hero-book.png" 
          alt="Magical Book" 
          className="w-96 md:w-[28rem] lg:w-[42rem] object-contain"
          animate={{ 
            y: [0, -6, 0],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            filter: 'drop-shadow(0 0 40px rgba(239, 200, 135, 0.4))',
          }}
        />
      </motion.div>
      
      {/* Floating Letters from Book - scattered across the scene */}
      <ScatteredLetters />
      
      {/* Main Content */}
      <motion.div 
        className="container mx-auto px-6 md:px-12 relative z-10"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-2xl">
          {/* Logo with animated "narrative" text */}
          <motion.div 
            className="mb-6 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img 
              src="/logo.png" 
              alt="Narrative" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <NarrativeText />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-moon-white text-glow-gold">{heroContent.title}</span>
              <br />
              <span className="bg-gradient-to-r from-sparkle-gold to-fairy-gold bg-clip-text text-transparent">
                {heroContent.titleHighlight}
              </span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-secondary max-w-lg leading-relaxed">
              {heroContent.subtitle}
            </p>
          </motion.div>
        </div>
      </motion.div>
      
    </section>
  );
}

// Letters scattered across the scene - flowing from book to upper left
function ScatteredLetters() {
  const LETTERS = ['A', 'B', 'E', 'G', 'M', 'N', 'R', 'S', 'T', 'X', 'U', 'V', 'I'];
  const [letters, setLetters] = useState<Array<{
    id: number;
    letter: string;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    rotation: number;
  }>>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    // Create initial scattered letters in a flowing pattern from book position upward
    const initial = Array.from({ length: 25 }, (_, i) => {
      // Create a path from book (right side) going upward and left
      const progress = i / 25;
      const baseX = 73 - progress * 15; // 73% to 58% (shifted ~2% left)
      const baseY = 58 - progress * 40; // 58% to 18%
      
      return {
        id: i,
        letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
        x: baseX + (Math.random() - 0.5) * 12,
        y: baseY + (Math.random() - 0.5) * 10,
        size: 16 + Math.random() * 28,
        duration: 15 + Math.random() * 10,
        delay: i * 0.15,
        rotation: -25 + Math.random() * 50,
      };
    });
    setLetters(initial);
    setNextId(25);
  }, []);

  // Continuously add new letters from book position
  useEffect(() => {
    const interval = setInterval(() => {
      setLetters(prev => {
        const filtered = prev.slice(-30);
        const newLetter = {
          id: nextId,
          letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
          x: 68 + Math.random() * 15, // Start near book position (shifted left)
          y: 53 + Math.random() * 15,
          size: 16 + Math.random() * 28,
          duration: 12 + Math.random() * 8,
          delay: 0,
          rotation: -25 + Math.random() * 50,
        };
        setNextId(n => n + 1);
        return [...filtered, newLetter];
      });
    }, 800);

    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {letters.map((letter) => (
        <motion.div
          key={letter.id}
          className="absolute font-display font-bold"
          style={{
            left: `${letter.x}%`,
            top: `${letter.y}%`,
            fontSize: `${letter.size}px`,
            color: '#EFC887',
            textShadow: '0 0 15px rgba(239, 200, 135, 0.7), 0 0 30px rgba(226, 202, 157, 0.4)',
          }}
          initial={{ 
            opacity: 0, 
            scale: 0.3,
            rotate: letter.rotation,
          }}
          animate={{ 
            opacity: [0, 0.9, 0.7, 0.5, 0],
            scale: [0.3, 1, 0.95, 0.85, 0.7],
            x: [0, -60, -150, -280, -420], // Drift more to the left
            y: [0, -20, -50, -90, -140], // Drift upward (less height, more diagonal)
            rotate: [letter.rotation, letter.rotation + 8, letter.rotation - 5, letter.rotation + 3, letter.rotation],
          }}
          transition={{
            duration: letter.duration,
            delay: letter.delay,
            ease: 'easeOut',
            times: [0, 0.15, 0.4, 0.7, 1],
          }}
        >
          {letter.letter}
        </motion.div>
      ))}
      
      {/* Stars and sparkles mixed with letters */}
      <MagicalSparkles />
    </div>
  );
}

// Sparkles and stars scattered around
function MagicalSparkles() {
  const [sparkles, setSparkles] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number; 
    size: number; 
    delay: number; 
    duration: number;
    type: 'dot' | 'star' | 'bigStar' | 'glitter';
  }>>([]);

  useEffect(() => {
    // General sparkles spread around
    const generalSparkles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 60,
      y: 15 + Math.random() * 60,
      size: 2 + Math.random() * 6,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      type: Math.random() > 0.7 ? 'star' as const : 'dot' as const,
    }));

    // Extra glitter concentrated around the book (right side, lower area)
    const bookGlitter = Array.from({ length: 30 }, (_, i) => ({
      id: 50 + i,
      x: 50 + Math.random() * 45, // Right side where book is
      y: 35 + Math.random() * 50, // Lower portion
      size: 1 + Math.random() * 4,
      delay: Math.random() * 6,
      duration: 2 + Math.random() * 3,
      type: 'glitter' as const,
    }));

    // Big glowing stars like the reference image
    const bigStars = Array.from({ length: 8 }, (_, i) => ({
      id: 80 + i,
      x: 45 + Math.random() * 50, // Around the book area
      y: 20 + Math.random() * 55,
      size: 20 + Math.random() * 25, // Bigger stars
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 3,
      type: 'bigStar' as const,
    }));

    setSparkles([...generalSparkles, ...bookGlitter, ...bigStars]);
  }, []);

  return (
    <>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            opacity: sparkle.type === 'bigStar' 
              ? [0, 0.9, 0.7, 0.9, 0] 
              : [0, 1, 0.6, 1, 0],
            scale: sparkle.type === 'bigStar'
              ? [0.3, 1, 0.9, 1.1, 0.3]
              : [0.5, 1.2, 1, 1.1, 0.5],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {sparkle.type === 'bigStar' ? (
            // Big glowing star using image
            <img 
              src="/star.png" 
              alt="Star" 
              className="w-full h-full object-contain"
              style={{ 
                filter: 'drop-shadow(0 0 8px rgba(255, 223, 130, 0.9)) drop-shadow(0 0 15px rgba(239, 200, 135, 0.8)) drop-shadow(0 0 25px rgba(239, 200, 135, 0.5))',
              }}
            />
          ) : sparkle.type === 'star' ? (
            <svg viewBox="0 0 24 24" fill="#EFC887" className="w-full h-full">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          ) : sparkle.type === 'glitter' ? (
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, #FFFDE7 0%, #EFC887 40%, transparent 70%)',
                boxShadow: '0 0 4px rgba(255, 253, 231, 1), 0 0 8px rgba(239, 200, 135, 0.8)',
              }}
            />
          ) : (
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, #EFC887 0%, transparent 70%)',
                boxShadow: '0 0 8px rgba(239, 200, 135, 0.9)',
              }}
            />
          )}
        </motion.div>
      ))}
    </>
  );
}

