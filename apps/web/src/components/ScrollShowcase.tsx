'use client';

import { useRef, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

// ============================================================================
// CHARACTER DATA - Personalities, colors, motion configs, voice signatures
// ============================================================================

interface Character {
  id: string;
  name: string;
  role: string;
  emoji: string;
  voiceColor: string;
  voiceColorLight: string;
  glowColor: string;
  position: { x: number; y: number }; // Final position offset from center
  entranceFrom: { x: number; y: number; scale: number; rotate: number };
  motionStyle: 'ethereal' | 'confident' | 'dramatic' | 'playful' | 'wise';
  springConfig: { stiffness: number; damping: number };
  waveformSpeed: number; // Pulse rhythm multiplier
  dialogLine: string;
}

const characters: Character[] = [
  {
    id: 'narrator',
    name: 'The Narrator',
    role: 'Storyteller',
    emoji: '📖',
    voiceColor: '#fbbf24', // Gold
    voiceColorLight: '#fef3c7',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    position: { x: 0, y: -20 },
    entranceFrom: { x: 0, y: 0, scale: 0, rotate: 0 },
    motionStyle: 'ethereal',
    springConfig: { stiffness: 80, damping: 20 },
    waveformSpeed: 1,
    dialogLine: '"Once upon a time..."',
  },
  {
    id: 'hero',
    name: 'The Hero',
    role: 'Protagonist',
    emoji: '⚔️',
    voiceColor: '#3b82f6', // Blue
    voiceColorLight: '#dbeafe',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    position: { x: -180, y: 60 },
    entranceFrom: { x: -300, y: 200, scale: 0.3, rotate: -15 },
    motionStyle: 'confident',
    springConfig: { stiffness: 120, damping: 12 },
    waveformSpeed: 1.2,
    dialogLine: '"I will find a way."',
  },
  {
    id: 'villain',
    name: 'The Villain',
    role: 'Antagonist',
    emoji: '🎭',
    voiceColor: '#dc2626', // Red
    voiceColorLight: '#fecaca',
    glowColor: 'rgba(220, 38, 38, 0.4)',
    position: { x: 180, y: 60 },
    entranceFrom: { x: 300, y: -150, scale: 0.2, rotate: 20 },
    motionStyle: 'dramatic',
    springConfig: { stiffness: 150, damping: 8 },
    waveformSpeed: 0.8,
    dialogLine: '"You cannot stop me."',
  },
  {
    id: 'sidekick',
    name: 'The Sidekick',
    role: 'Companion',
    emoji: '🌟',
    voiceColor: '#22c55e', // Green
    voiceColorLight: '#dcfce7',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    position: { x: -120, y: 150 },
    entranceFrom: { x: -100, y: 300, scale: 0.5, rotate: 10 },
    motionStyle: 'playful',
    springConfig: { stiffness: 200, damping: 8 },
    waveformSpeed: 1.5,
    dialogLine: '"Right behind you!"',
  },
  {
    id: 'mentor',
    name: 'The Mentor',
    role: 'Guide',
    emoji: '🔮',
    voiceColor: '#a855f7', // Purple
    voiceColorLight: '#f3e8ff',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    position: { x: 120, y: 150 },
    entranceFrom: { x: 150, y: 250, scale: 0.4, rotate: -5 },
    motionStyle: 'wise',
    springConfig: { stiffness: 60, damping: 25 },
    waveformSpeed: 0.6,
    dialogLine: '"Trust in yourself."',
  },
];

// Story text lines that will animate
const storyLines = [
  'In a world where stories sleep...',
  'Waiting for a voice to speak...',
  'Characters dream of being heard...',
  'Each one unique, each one alive...',
  'Now, they awaken.',
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Animated text line with stagger effect
function AnimatedTextLine({
  line,
  index,
  scrollProgress,
  totalLines,
}: {
  line: string;
  index: number;
  scrollProgress: MotionValue<number>;
  totalLines: number;
}) {
  // Stagger timing - each line starts lifting at different scroll points
  const staggerDelay = index * 0.03;
  const liftStart = 0.15 + staggerDelay;
  const liftEnd = 0.35 + staggerDelay;
  
  const y = useTransform(scrollProgress, [liftStart, liftEnd], [0, -80 - index * 30]);
  const opacity = useTransform(scrollProgress, [0, 0.05, liftStart, liftEnd, 0.45], [0.5, 0.7, 0.7, 1, 0]);
  const scale = useTransform(scrollProgress, [liftStart, liftEnd], [1, 1.1]);
  const letterSpacing = useTransform(scrollProgress, [liftStart, liftEnd], [0, 4]);
  
  // Color transition from gray to vibrant
  const color = useTransform(
    scrollProgress,
    [0.1, 0.3],
    ['rgb(107, 114, 128)', 'rgb(196, 181, 253)']
  );

  return (
    <motion.div
      style={{ y, opacity, scale, letterSpacing, color }}
      className="text-center font-serif text-lg md:text-xl italic whitespace-nowrap"
    >
      {line}
    </motion.div>
  );
}

// Voice waveform SVG for each character
function VoiceWaveform({
  character,
  scrollProgress,
  isActive,
}: {
  character: Character;
  scrollProgress: MotionValue<number>;
  isActive: MotionValue<number>;
}) {
  const bars = 12;
  const barWidth = 3;
  const gap = 2;
  const maxHeight = 40;
  
  return (
    <motion.svg
      width={(barWidth + gap) * bars}
      height={maxHeight}
      className="absolute -bottom-12 left-1/2 -translate-x-1/2"
      style={{ opacity: isActive }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        // Create varied heights based on position for organic look
        const baseHeight = Math.sin((i / bars) * Math.PI) * 0.7 + 0.3;
        const phaseOffset = (i / bars) * Math.PI * 2 * character.waveformSpeed;
        
        return (
          <motion.rect
            key={i}
            x={i * (barWidth + gap)}
            width={barWidth}
            rx={1.5}
            fill={character.voiceColor}
            style={{
              height: useTransform(scrollProgress, (p) => {
                const wave = Math.sin(p * 10 * character.waveformSpeed + phaseOffset);
                return baseHeight * maxHeight * (0.5 + wave * 0.5);
              }),
              y: useTransform(scrollProgress, (p) => {
                const wave = Math.sin(p * 10 * character.waveformSpeed + phaseOffset);
                const height = baseHeight * maxHeight * (0.5 + wave * 0.5);
                return (maxHeight - height) / 2;
              }),
            }}
          />
        );
      })}
    </motion.svg>
  );
}

// Character avatar with unique entrance animation
function CharacterAvatar({
  character,
  scrollProgress,
}: {
  character: Character;
  scrollProgress: MotionValue<number>;
}) {
  // Character appearance timing - start earlier to overlap with book/text
  const appearStart = 0.25;
  const appearEnd = 0.45;
  const finalStart = 0.55;
  const finalEnd = 0.75;
  
  // Smooth spring for organic movement
  const springProgress = useSpring(scrollProgress, character.springConfig);
  
  // Position transforms
  const x = useTransform(
    springProgress,
    [appearStart, appearEnd, finalStart, finalEnd],
    [character.entranceFrom.x, character.position.x * 0.5, character.position.x * 0.8, character.position.x]
  );
  const y = useTransform(
    springProgress,
    [appearStart, appearEnd, finalStart, finalEnd],
    [character.entranceFrom.y, character.position.y * 0.5, character.position.y * 0.8, character.position.y]
  );
  const scale = useTransform(
    scrollProgress,
    [appearStart, appearEnd],
    [character.entranceFrom.scale, 1]
  );
  const rotate = useTransform(
    springProgress,
    [appearStart, appearEnd],
    [character.entranceFrom.rotate, 0]
  );
  const opacity = useTransform(scrollProgress, [appearStart, appearStart + 0.05], [0, 1]);
  
  // Glow intensity
  const glowOpacity = useTransform(scrollProgress, [appearEnd, 0.7], [0.3, 0.6]);
  
  // Voice waveform visibility
  const waveformOpacity = useTransform(scrollProgress, [0.4, 0.5], [0, 1]);
  
  // Dialog visibility
  const dialogOpacity = useTransform(scrollProgress, [0.6, 0.7], [0, 1]);
  const dialogY = useTransform(scrollProgress, [0.6, 0.7], [10, 0]);

  // Motion-specific effects
  const getMotionEffect = () => {
    switch (character.motionStyle) {
      case 'ethereal':
        return { filter: 'blur(0px)' };
      case 'dramatic':
        return { filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))' };
      default:
        return {};
    }
  };

  return (
    <motion.div
      style={{ x, y, scale, rotate, opacity }}
      className="absolute flex flex-col items-center"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute w-24 h-24 rounded-full blur-xl"
        style={{
          backgroundColor: character.glowColor,
          opacity: glowOpacity,
        }}
      />
      
      {/* Avatar circle */}
      <motion.div
        className="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 shadow-xl z-10"
        style={{
          background: `linear-gradient(135deg, ${character.voiceColor}, ${character.voiceColorLight})`,
          borderColor: character.voiceColor,
          ...getMotionEffect(),
        }}
      >
        <span className="text-2xl md:text-3xl">{character.emoji}</span>
      </motion.div>
      
      {/* Character name */}
      <motion.div
        className="mt-2 text-center"
        style={{ opacity: waveformOpacity }}
      >
        <div className="text-xs font-medium text-white/90">{character.name}</div>
        <div className="text-[10px] text-white/50">{character.role}</div>
      </motion.div>
      
      {/* Voice waveform */}
      <VoiceWaveform
        character={character}
        scrollProgress={scrollProgress}
        isActive={waveformOpacity}
      />
      
      {/* Dialog line */}
      <motion.div
        className="absolute -top-12 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          opacity: dialogOpacity,
          y: dialogY,
          backgroundColor: `${character.voiceColor}20`,
          color: character.voiceColor,
          border: `1px solid ${character.voiceColor}40`,
        }}
      >
        {character.dialogLine}
      </motion.div>
    </motion.div>
  );
}

// Central book with animated pages
function AnimatedBook({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const bookScale = useTransform(scrollProgress, [0, 0.1, 0.35, 0.45], [1.2, 1, 0.8, 0]);
  const bookOpacity = useTransform(scrollProgress, [0, 0.05, 0.35, 0.45], [0.5, 1, 1, 0]);
  const bookY = useTransform(scrollProgress, [0, 0.1, 0.35], [50, 0, -50]);
  const pageRotateLeft = useTransform(scrollProgress, [0.1, 0.3], [-5, -30]);
  const pageRotateRight = useTransform(scrollProgress, [0.1, 0.3], [5, 30]);
  const innerGlow = useTransform(scrollProgress, [0.15, 0.35], [0, 0.8]);

  return (
    <motion.div
      className="absolute z-10"
      style={{ scale: bookScale, opacity: bookOpacity, y: bookY }}
    >
      {/* Book glow */}
      <motion.div
        className="absolute inset-0 bg-primary-500 rounded-3xl blur-3xl scale-150"
        style={{ opacity: innerGlow }}
      />
      
      {/* Book container */}
      <div className="relative w-40 h-52 md:w-48 md:h-64">
        {/* Left page */}
        <motion.div
          className="absolute left-0 w-1/2 h-full bg-gradient-to-r from-amber-100 to-amber-50 rounded-l-lg shadow-lg origin-right"
          style={{ rotateY: pageRotateLeft }}
        >
          <div className="p-3 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 bg-gray-300/50 rounded"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Right page */}
        <motion.div
          className="absolute right-0 w-1/2 h-full bg-gradient-to-l from-amber-100 to-amber-50 rounded-r-lg shadow-lg origin-left"
          style={{ rotateY: pageRotateRight }}
        >
          <div className="p-3 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 bg-gray-300/50 rounded"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Book spine */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2 h-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded shadow-inner" />
        
        {/* Magic emerging from book */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32"
          style={{ opacity: innerGlow }}
        >
          <div className="w-full h-full bg-gradient-to-t from-primary-500/60 via-accent-pink/40 to-transparent rounded-full blur-2xl" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Central waveform visualizer
function CentralWaveform({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const opacity = useTransform(scrollProgress, [0.15, 0.25, 0.75, 0.85], [0, 1, 1, 0]);
  const scale = useTransform(scrollProgress, [0.2, 0.4], [0.5, 1]);
  
  const bars = 24;
  const barWidth = 4;
  const gap = 4;
  const maxHeight = 80;

  return (
    <motion.div
      className="absolute z-5"
      style={{ opacity, scale }}
    >
      <svg
        width={(barWidth + gap) * bars}
        height={maxHeight}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {Array.from({ length: bars }).map((_, i) => {
          const centerDist = Math.abs(i - bars / 2) / (bars / 2);
          const baseHeight = (1 - centerDist * 0.6) * maxHeight;
          
          return (
            <motion.rect
              key={i}
              x={i * (barWidth + gap)}
              width={barWidth}
              rx={2}
              fill="url(#waveGradient)"
              style={{
                height: useTransform(scrollProgress, (p) => {
                  const phase = (i / bars) * Math.PI * 4;
                  const wave = Math.sin(p * 15 + phase);
                  return baseHeight * (0.4 + wave * 0.3 + p * 0.3);
                }),
                y: useTransform(scrollProgress, (p) => {
                  const phase = (i / bars) * Math.PI * 4;
                  const wave = Math.sin(p * 15 + phase);
                  const height = baseHeight * (0.4 + wave * 0.3 + p * 0.3);
                  return (maxHeight - height) / 2;
                }),
                opacity: useTransform(scrollProgress, [0.2, 0.4], [0.3, 0.8]),
              }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}

// SVG connection lines between characters
function ConnectionLines({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const opacity = useTransform(scrollProgress, [0.55, 0.65, 0.85, 0.95], [0, 0.6, 0.6, 0]);
  const pathLength = useTransform(scrollProgress, [0.7, 0.85], [0, 1]);

  // Connections between characters
  const connections = [
    { from: characters[0], to: characters[1], curve: -30 }, // Narrator to Hero
    { from: characters[0], to: characters[2], curve: 30 },  // Narrator to Villain
    { from: characters[1], to: characters[3], curve: -20 }, // Hero to Sidekick
    { from: characters[2], to: characters[4], curve: 20 },  // Villain to Mentor
    { from: characters[3], to: characters[4], curve: 0 },   // Sidekick to Mentor
  ];

  return (
    <motion.svg
      className="absolute w-full h-full pointer-events-none"
      style={{ opacity }}
      viewBox="-250 -200 500 400"
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {connections.map((conn, i) => {
        const startX = conn.from.position.x;
        const startY = conn.from.position.y;
        const endX = conn.to.position.x;
        const endY = conn.to.position.y;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 + conn.curve;
        
        const d = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        
        return (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ pathLength }}
          />
        );
      })}
    </motion.svg>
  );
}

// Particle effects
function Particles({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const particles = useMemo(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      startX: (Math.random() - 0.5) * 400,
      startY: 100 + Math.random() * 100,
      endX: (Math.random() - 0.5) * 600,
      endY: -200 - Math.random() * 200,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.3,
      color: ['#a855f7', '#ec4899', '#fbbf24', '#3b82f6', '#22c55e'][Math.floor(Math.random() * 5)],
    })), []
  );

  const opacity = useTransform(scrollProgress, [0.15, 0.25, 0.6, 0.7], [0, 1, 1, 0]);

  return (
    <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            x: useTransform(scrollProgress, [0.15 + p.delay, 0.6], [p.startX, p.endX]),
            y: useTransform(scrollProgress, [0.15 + p.delay, 0.6], [p.startY, p.endY]),
            opacity: useTransform(scrollProgress, [0.15 + p.delay, 0.2 + p.delay, 0.5, 0.6], [0, 1, 1, 0]),
            scale: useTransform(scrollProgress, [0.15 + p.delay, 0.3, 0.5], [0, 1, 0.5]),
          }}
        />
      ))}
    </motion.div>
  );
}

// Final text reveal
function FinalText({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const opacity = useTransform(scrollProgress, [0.7, 0.85], [0, 1]);
  const y = useTransform(scrollProgress, [0.7, 0.85], [30, 0]);
  const scale = useTransform(scrollProgress, [0.7, 0.85], [0.9, 1]);

  return (
    <motion.div
      className="absolute bottom-16 md:bottom-24 left-0 right-0 text-center px-4 z-30"
      style={{ opacity, y, scale }}
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-card/80 backdrop-blur border border-dark-border mb-4">
        <motion.span 
          className="w-2 h-2 rounded-full bg-accent-pink"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-sm text-primary-300">The Immersive Experience</span>
      </div>
      
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-accent-pink">
        Every Voice Tells a Story
      </h2>
      
      <p className="text-base md:text-xl text-gray-400 max-w-xl mx-auto">
        Characters with unique voices, personalities, and souls.
        <br className="hidden md:block" />
        Step into worlds that truly come alive.
      </p>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // #region agent log - H1,H2,H3: Track scroll progress and container info
  useEffect(() => {
    // Log initial mount state
    const containerRect = containerRef.current?.getBoundingClientRect();
    const stickyEl = containerRef.current?.querySelector('.sticky');
    const stickyRect = stickyEl?.getBoundingClientRect();
    const stickyStyle = stickyEl ? window.getComputedStyle(stickyEl) : null;
    fetch('http://127.0.0.1:7243/ingest/293b623b-afcb-4e93-8820-5d9b335cef86',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ScrollShowcase.tsx:mount',message:'component-mounted',data:{containerHeight:containerRect?.height,stickyPosition:stickyStyle?.position,stickyTop:stickyStyle?.top,viewportHeight:window.innerHeight,sectionScrollHeight:containerRef.current?.scrollHeight},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H3,H4'})}).catch(()=>{});
    
    const unsubscribe = scrollYProgress.on('change', (value) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const stickyEl = containerRef.current?.querySelector('.sticky');
      const stickyRect = stickyEl?.getBoundingClientRect();
      fetch('http://127.0.0.1:7243/ingest/293b623b-afcb-4e93-8820-5d9b335cef86',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ScrollShowcase.tsx:useEffect',message:'scroll-progress-update',data:{scrollYProgress:value,containerTop:containerRect?.top,containerBottom:containerRect?.bottom,containerHeight:containerRect?.height,stickyTop:stickyRect?.top,stickyBottom:stickyRect?.bottom,viewportHeight:window.innerHeight,offset:'start-start_end-start'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H2,H3'})}).catch(()=>{});
    });
    return () => unsubscribe();
  }, [scrollYProgress]);
  // #endregion

  // Smooth the scroll progress for more fluid animations
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30,
    restDelta: 0.001 
  });

  // Background effects
  const bgRotate = useTransform(smoothProgress, [0, 1], [0, 30]);
  const bgScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.2, 1]);

  return (
    <section 
      id="showcase"
      ref={containerRef} 
      className="relative min-h-[300vh] bg-dark-bg"
    >
      {/* Sticky container for all animated content */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
        {/* Animated background */}
        <motion.div
          style={{ rotate: bgRotate, scale: bgScale }}
          className="absolute inset-0"
        >
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-pink/10 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px]" />
        </motion.div>

        {/* Animated text lines (Phase 1-2) */}
        <div className="absolute flex flex-col items-center gap-3 z-20">
          {storyLines.map((line, i) => (
            <AnimatedTextLine
              key={i}
              line={line}
              index={i}
              scrollProgress={smoothProgress}
              totalLines={storyLines.length}
            />
          ))}
        </div>

        {/* Book animation (Phase 1-2) */}
        <AnimatedBook scrollProgress={smoothProgress} />

        {/* Particle effects (Phase 2-3) */}
        <Particles scrollProgress={smoothProgress} />

        {/* Central waveform (Phase 2-4) */}
        <CentralWaveform scrollProgress={smoothProgress} />

        {/* Character avatars (Phase 3-5) */}
        {characters.map((character) => (
          <CharacterAvatar
            key={character.id}
            character={character}
            scrollProgress={smoothProgress}
          />
        ))}

        {/* Connection lines between characters (Phase 4) */}
        <ConnectionLines scrollProgress={smoothProgress} />

        {/* Final text reveal (Phase 5) */}
        <FinalText scrollProgress={smoothProgress} />

        {/* Sound wave bars - left side */}
        <motion.div 
          className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 flex gap-1"
          style={{ 
            opacity: useTransform(smoothProgress, [0.3, 0.4, 0.9, 1], [0, 1, 1, 0]) 
          }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`left-${i}`}
              className="w-1 md:w-1.5 rounded-full origin-center"
              style={{ 
                height: useTransform(smoothProgress, (p) => {
                  const wave = Math.sin(p * 12 + i * 0.5);
                  return 40 + wave * 20 + i * 5;
                }),
                background: `linear-gradient(to top, #a855f7, #ec4899)`,
              }}
            />
          ))}
        </motion.div>

        {/* Sound wave bars - right side */}
        <motion.div 
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 flex gap-1"
          style={{ 
            opacity: useTransform(smoothProgress, [0.3, 0.4, 0.9, 1], [0, 1, 1, 0]) 
          }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`right-${i}`}
              className="w-1 md:w-1.5 rounded-full origin-center"
              style={{ 
                height: useTransform(smoothProgress, (p) => {
                  const wave = Math.sin(p * 12 + (5 - i) * 0.5 + Math.PI);
                  return 40 + wave * 20 + (5 - i) * 5;
                }),
                background: `linear-gradient(to top, #ec4899, #a855f7)`,
              }}
            />
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ 
            opacity: useTransform(smoothProgress, [0, 0.1, 0.2], [1, 1, 0]) 
          }}
        >
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            className="w-5 h-8 rounded-full border border-gray-600 flex justify-center pt-1"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1 h-2 bg-primary-500 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
