'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: scrolled ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-overlay backdrop-blur-xl border-b border-fairy pointer-events-auto' 
          : 'pointer-events-none'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Narrative" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-display font-bold bg-gradient-to-r from-moon-white to-fairy-gold bg-clip-text text-transparent">
              Narrative
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#how-it-works" 
              className="text-secondary hover:text-fairy-gold transition-colors duration-200"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="text-secondary hover:text-fairy-gold transition-colors duration-200"
            >
              Features
            </a>
            <a 
              href="#roadmap" 
              className="text-secondary hover:text-fairy-gold transition-colors duration-200"
            >
              Roadmap
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-28 h-10 bg-deep-violet rounded-full animate-pulse" />
            ) : user ? (
              <Link
                href="/library"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sparkle-gold to-warm-glow text-midnight font-semibold hover:shadow-glow-gold transition-all duration-300"
              >
                Go to Library
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-secondary hover:text-fairy-gold transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sparkle-gold to-warm-glow text-midnight font-semibold hover:shadow-glow-gold transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
