'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@taleify/supabase';

interface VoiceStory {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  voice_id: string | null;
  voice_name: string | null;
  chapters: { count: number }[];
}

function VoiceStoryCard({ story }: { story: VoiceStory }) {
  return (
    <Link 
      href={`/play/${story.id}`}
      className="group relative flex-shrink-0 w-48 md:w-56"
    >
      <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden transition-all duration-300 hover:border-accent-pink/50 hover:shadow-glow-pink hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-dark-elevated to-dark-bg overflow-hidden">
          {story.cover_url ? (
            <Image
              src={story.cover_url}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-pink/20 to-primary-500/20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-pink/30 to-primary-500/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Voice badge */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-accent-pink/90 text-white text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            Your Voice
          </div>
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-14 h-14 rounded-full bg-accent-pink flex items-center justify-center transition-transform duration-300 scale-75 group-hover:scale-100">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-1 text-sm text-white group-hover:text-accent-pink transition-colors">
            {story.title}
          </h3>
          <p className="text-xs text-gray-400 mb-2">{story.author}</p>
          
          {story.voice_name && (
            <div className="flex items-center gap-1.5 text-[10px] text-accent-pink/80">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="truncate">{story.voice_name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MyVoiceSection() {
  const [stories, setStories] = useState<VoiceStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVoiceStories() {
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      try {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            author,
            description,
            cover_url,
            voice_id,
            voice_name,
            chapters:chapters(count)
          `)
          .not('voice_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          // If voice_id column doesn't exist yet, silently fail
          if (error.message?.includes('voice_id') || error.code === '42703') {
            console.log('Voice columns not yet available in database');
          } else {
            console.error('Error fetching voice stories:', error);
          }
        } else {
          setStories(data as VoiceStory[] || []);
        }
      } catch (err) {
        console.error('Failed to fetch voice stories:', err);
      }
      setLoading(false);
    }

    fetchVoiceStories();
  }, []);

  // Don't render section if no voice stories
  if (!loading && stories.length === 0) {
    return null;
  }

  return (
    <section id="my-voice" className="py-16 bg-dark-bg relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-pink/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Voice icon with animated rings */}
            <div className="relative">
              <div className="absolute inset-0 bg-accent-pink/30 rounded-full blur-xl animate-pulse" aria-hidden="true" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-accent-pink to-primary-500 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full border-2 border-accent-pink/30 animate-ping" style={{ animationDuration: '2s' }} aria-hidden="true" />
              <div className="absolute inset-[-4px] rounded-full border border-accent-pink/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} aria-hidden="true" />
            </div>
            
           
          </div>
          
          {/* Decorative waveform */}
          <div className="hidden md:flex items-center gap-1 opacity-60" aria-hidden="true">
            {[20, 28, 32, 30, 35, 32, 35, 30, 32, 28, 20, 15].map((height, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-accent-pink to-primary-500 rounded-full animate-pulse"
                style={{
                  height: `${height}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>
        </header>

        {/* Stories horizontal scroll */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 md:w-56">
                <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-dark-elevated" />
                  <div className="p-4">
                    <div className="h-4 bg-dark-elevated rounded w-3/4 mb-2" />
                    <div className="h-3 bg-dark-elevated rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-dark-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-dark-bg to-transparent z-10 pointer-events-none" />
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {stories.map((story) => (
                <VoiceStoryCard key={story.id} story={story} />
              ))}
              
              {/* Create new card */}
              <Link 
                href="/admin/upload"
                className="flex-shrink-0 w-48 md:w-56 group"
              >
                <div className="h-full rounded-2xl border-2 border-dashed border-dark-border bg-dark-card/50 hover:border-accent-pink/50 hover:bg-dark-card transition-all duration-300 flex flex-col items-center justify-center aspect-[3/4] p-6">
                  <div className="w-16 h-16 rounded-full bg-dark-elevated border border-dark-border group-hover:border-accent-pink/50 flex items-center justify-center mb-4 transition-colors">
                    <svg className="w-8 h-8 text-gray-500 group-hover:text-accent-pink transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors text-center">
                    Create New Audiobook
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    with your voice
                  </span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
