'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseClient } from '@taleify/supabase';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await (supabase
        .from('waitlist_emails') as any)
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          setMessage('This email is already on the waitlist!');
          setStatus('error');
        } else {
          throw error;
        }
      } else {
        setMessage('Successfully joined the waitlist! We\'ll be in touch soon.');
        setStatus('success');
        setEmail('');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      setMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === 'loading'}
          className="flex-1 px-6 py-4 rounded-full bg-deep-violet border border-fairy text-moon-white placeholder:text-mauve-muted focus:outline-none focus:border-sparkle-gold focus:ring-2 focus:ring-sparkle-gold/20 disabled:opacity-50 transition-all duration-300"
        />
        <motion.button
          type="submit"
          disabled={status === 'loading'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 rounded-full font-semibold bg-gradient-to-r from-sparkle-gold to-warm-glow text-midnight hover:shadow-glow-gold-lg transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Joining...
            </span>
          ) : (
            'Join Waitlist'
          )}
        </motion.button>
      </form>
      
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl text-center ${
            status === 'success'
              ? 'bg-enchanted-blue/10 border border-enchanted-blue/30 text-enchanted-blue'
              : 'bg-amber-copper/10 border border-amber-copper/30 text-amber-copper'
          }`}
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}
