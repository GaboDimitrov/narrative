'use client';

import { useState } from 'react';
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
    <div id="waitlist">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === 'loading'}
          className="flex-1 px-6 py-4 rounded-full bg-dark-card border border-dark-border text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-8 py-4 rounded-full font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>
      
      {message && (
        <div
          className={`mt-6 p-4 rounded-xl text-center ${
            status === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
