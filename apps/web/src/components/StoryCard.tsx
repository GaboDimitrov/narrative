'use client';

import Image from 'next/image';
import { usePlayer } from '@/contexts/PlayerContext';

interface StoryCardProps {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverUrl: string | null;
  chapterCount: number;
}

export function StoryCard({ id, title, author, description, coverUrl, chapterCount }: StoryCardProps) {
  const { playStory, story: currentStory, isPlaying } = usePlayer();
  const isCurrentStory = currentStory?.id === id;

  const handleClick = () => {
    playStory(id);
  };

  return (
    <button onClick={handleClick} className="group block text-left w-full">
      <div className={`rounded-2xl bg-dark-card border overflow-hidden transition-all duration-300 hover:border-primary-500/50 hover:shadow-glow hover:-translate-y-1 ${
        isCurrentStory ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-dark-border'
      }`}>
        {/* Cover Image */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-dark-elevated to-dark-bg overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-pink/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Play overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 flex items-center justify-center ${
            isCurrentStory ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <div className={`w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center transition-transform duration-300 ${
              isCurrentStory ? 'scale-100' : 'scale-75 group-hover:scale-100'
            }`}>
              {isCurrentStory && isPlaying ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </div>

          {/* Now playing indicator */}
          {isCurrentStory && isPlaying && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary-500/90 text-white text-xs font-medium flex items-center gap-1.5">
              <span className="flex gap-0.5">
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </span>
              Playing
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className={`font-semibold mb-1 line-clamp-1 transition-colors ${
            isCurrentStory ? 'text-primary-300' : 'text-white group-hover:text-primary-300'
          }`}>
            {title}
          </h3>
          <p className="text-sm text-gray-400 mb-2">{author}</p>
          
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>{chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
