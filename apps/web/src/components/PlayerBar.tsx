'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePlayer } from '@/contexts/PlayerContext';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PlayerBar() {
  const {
    story,
    chapters,
    currentChapterIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    nextChapter,
    previousChapter,
    goToChapter,
    setVolume,
    toggleMute,
    setPlaybackRate,
  } = usePlayer();

  const [showChapters, setShowChapters] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const currentChapter = chapters[currentChapterIndex];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Don't render if no story is loaded
  if (!story || chapters.length === 0) {
    return null;
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    seek(newTime);
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <>
      {/* Chapter selector popup */}
      {showChapters && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 max-h-80 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Chapters</h3>
              <p className="text-xs text-gray-500">{chapters.length} chapters</p>
            </div>
            <button
              onClick={() => setShowChapters(false)}
              className="p-1.5 rounded-lg hover:bg-dark-elevated transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto max-h-60">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => {
                  goToChapter(index);
                  setShowChapters(false);
                }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-dark-elevated transition-colors text-left ${
                  index === currentChapterIndex ? 'bg-primary-500/10' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                  index === currentChapterIndex
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-elevated text-gray-400'
                }`}>
                  {index === currentChapterIndex && isPlaying ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-sm truncate ${
                  index === currentChapterIndex ? 'text-primary-300' : 'text-gray-300'
                }`}>
                  {chapter.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main player bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Progress bar (clickable) */}
        <div
          onClick={handleProgressClick}
          className="h-1 bg-dark-border cursor-pointer group"
        >
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Player controls */}
        <div className="bg-dark-card/95 backdrop-blur-xl border-t border-dark-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-20">
              {/* Left: Story info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Cover */}
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-dark-elevated flex-shrink-0">
                  {story.cover_url ? (
                    <Image
                      src={story.cover_url}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title & chapter */}
                <div className="min-w-0 hidden sm:block">
                  <p className="text-white font-medium truncate text-sm">{story.title}</p>
                  <p className="text-gray-500 text-xs truncate">
                    {currentChapter?.title || 'Loading...'}
                  </p>
                </div>
              </div>

              {/* Center: Main controls */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Skip backward */}
                  <button
                    onClick={() => skipBackward(15)}
                    className="p-2 rounded-full hover:bg-dark-elevated transition-colors hidden sm:block"
                    title="Skip back 15 seconds"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                    </svg>
                  </button>

                  {/* Previous chapter */}
                  <button
                    onClick={previousChapter}
                    disabled={currentChapterIndex === 0}
                    className="p-2 rounded-full hover:bg-dark-elevated transition-colors disabled:opacity-30"
                    title="Previous chapter"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 flex items-center justify-center shadow-lg hover:shadow-glow transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : isPlaying ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Next chapter */}
                  <button
                    onClick={nextChapter}
                    disabled={currentChapterIndex === chapters.length - 1}
                    className="p-2 rounded-full hover:bg-dark-elevated transition-colors disabled:opacity-30"
                    title="Next chapter"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>

                  {/* Skip forward */}
                  <button
                    onClick={() => skipForward(15)}
                    className="p-2 rounded-full hover:bg-dark-elevated transition-colors hidden sm:block"
                    title="Skip forward 15 seconds"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                    </svg>
                  </button>
                </div>

                {/* Time display - below controls on mobile */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: Secondary controls */}
              <div className="flex items-center gap-1 flex-1 justify-end">
                {/* Chapters button */}
                <button
                  onClick={() => setShowChapters(!showChapters)}
                  className={`p-2 rounded-lg transition-colors ${
                    showChapters ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-dark-elevated text-gray-400'
                  }`}
                  title="Chapters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>

                {/* Volume (desktop only) */}
                <div className="hidden md:flex items-center gap-1 relative">
                  <button
                    onClick={toggleMute}
                    onMouseEnter={() => setShowVolume(true)}
                    className="p-2 rounded-lg hover:bg-dark-elevated transition-colors text-gray-400"
                  >
                    {isMuted || volume === 0 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                  {showVolume && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-dark-card border border-dark-border rounded-lg shadow-xl"
                      onMouseLeave={() => setShowVolume(false)}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-1.5 bg-dark-elevated rounded-full appearance-none cursor-pointer accent-primary-500 rotate-0"
                      />
                    </div>
                  )}
                </div>

                {/* Playback speed */}
                <button
                  onClick={cyclePlaybackRate}
                  className="px-2 py-1 text-xs font-medium bg-dark-elevated hover:bg-dark-border rounded-lg transition-colors text-gray-400 hidden sm:block"
                >
                  {playbackRate}x
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
