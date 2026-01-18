'use client';

import Link from 'next/link';
import Image from 'next/image';

interface HistoryCardProps {
  storyId: string;
  storyTitle: string;
  author: string;
  coverUrl: string | null;
  chapterTitle: string;
  chapterIndex: number;
  positionMs: number;
  durationMs: number | null;
  updatedAt: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function HistoryCard({
  storyId,
  storyTitle,
  author,
  coverUrl,
  chapterTitle,
  chapterIndex,
  positionMs,
  durationMs,
  updatedAt,
}: HistoryCardProps) {
  const progress = durationMs ? Math.min((positionMs / durationMs) * 100, 100) : 0;

  return (
    <Link href={`/play/${storyId}`} className="group block">
      <div className="flex gap-4 p-4 rounded-2xl bg-dark-card border border-dark-border transition-all duration-300 hover:border-primary-500/50 hover:shadow-glow">
        {/* Cover */}
        <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-dark-elevated to-dark-bg">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={storyTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
              {storyTitle}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatRelativeTime(updatedAt)}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-2">{author}</p>
          
          <p className="text-sm text-gray-500 mb-3">
            Chapter {chapterIndex + 1}: {chapterTitle}
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-dark-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatTime(positionMs)} {durationMs ? `/ ${formatTime(durationMs)}` : ''}
            </span>
          </div>
        </div>

        {/* Play button */}
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-all">
            <svg className="w-5 h-5 text-primary-400 ml-0.5 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
