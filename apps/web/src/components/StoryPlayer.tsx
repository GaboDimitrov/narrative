'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Intro sound path (Black Mirror style opening)
const INTRO_SOUND_URL = '/audio/intro-sound.mp3';

interface Chapter {
  id: string;
  story_id: string;
  title: string;
  order_index: number;
  audio_url: string;
  duration_ms: number | null;
  created_at: string;
}

interface Story {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
}

interface StoryPlayerProps {
  story: Story;
  chapters: Chapter[];
  progressMap: Record<string, number>;
  userId: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(ms: number | null): string {
  if (!ms) return '--:--';
  return formatTime(ms / 1000);
}

export function StoryPlayer({ story, chapters, progressMap, userId }: StoryPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const introAudioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Find the chapter with the most recent progress, or default to first
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    if (chapters.length === 0) return 0;
    
    // Find chapter with progress
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (progressMap[chapters[i].id] !== undefined) {
        return i;
      }
    }
    return 0;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showChapterList, setShowChapterList] = useState(false);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);

  const currentChapter = chapters[currentChapterIndex];
  const hasChapters = chapters.length > 0;

  // Save progress to Supabase
  const saveProgress = useCallback(async (chapterId: string, positionMs: number) => {
    try {
      const supabase = createSupabaseBrowserClient();
      await (supabase
        .from('playback_progress') as any)
        .upsert({
          user_id: userId,
          chapter_id: chapterId,
          position_ms: positionMs,
        }, {
          onConflict: 'user_id,chapter_id',
        });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [userId]);

  // Debounced save progress
  const debouncedSaveProgress = useCallback((chapterId: string, positionMs: number) => {
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }
    saveProgressTimeoutRef.current = setTimeout(() => {
      saveProgress(chapterId, positionMs);
    }, 2000);
  }, [saveProgress]);

  // Load audio and restore progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentChapter) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      
      // Restore progress
      const savedProgress = progressMap[currentChapter.id];
      if (savedProgress !== undefined) {
        audio.currentTime = savedProgress / 1000;
        setCurrentTime(savedProgress / 1000);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      debouncedSaveProgress(currentChapter.id, Math.floor(audio.currentTime * 1000));
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next chapter
      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(prev => prev + 1);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentChapter, currentChapterIndex, chapters.length, progressMap, debouncedSaveProgress]);

  // Reset audio when chapter changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentChapter) {
      audio.load();
      setCurrentTime(0);
      // Reset intro flag so it plays again for the new chapter
      setHasPlayedIntro(false);
      setIsPlayingIntro(false);
      // Auto-play if was playing (will trigger intro first)
      if (isPlaying) {
        // Small delay to let the audio load
        setTimeout(() => {
          playIntroThenStory();
        }, 100);
      }
    }
  }, [currentChapter?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
    };
  }, []);

  // Play intro sound before the story starts
  const playIntroThenStory = useCallback(() => {
    const introAudio = introAudioRef.current;
    const mainAudio = audioRef.current;
    
    if (!introAudio || !mainAudio) return;
    
    // If intro hasn't been played yet, play it first
    if (!hasPlayedIntro) {
      setIsPlayingIntro(true);
      setIsPlaying(true);
      
      introAudio.volume = isMuted ? 0 : volume;
      introAudio.play().catch(() => {
        // If intro fails to play, just start the main audio
        setIsPlayingIntro(false);
        setHasPlayedIntro(true);
        mainAudio.play();
      });
    } else {
      // Intro already played, just play the main audio
      mainAudio.play();
    }
  }, [hasPlayedIntro, isMuted, volume]);

  // Handle intro audio ending
  useEffect(() => {
    const introAudio = introAudioRef.current;
    const mainAudio = audioRef.current;
    
    if (!introAudio || !mainAudio) return;
    
    const handleIntroEnded = () => {
      setIsPlayingIntro(false);
      setHasPlayedIntro(true);
      // Start the main audio after intro finishes
      mainAudio.play().catch(() => {});
    };
    
    introAudio.addEventListener('ended', handleIntroEnded);
    
    return () => {
      introAudio.removeEventListener('ended', handleIntroEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const introAudio = introAudioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Pause both intro and main audio
      if (isPlayingIntro && introAudio) {
        introAudio.pause();
      }
      audio.pause();
    } else {
      playIntroThenStory();
    }
  }, [isPlaying, isPlayingIntro, playIntroThenStory]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 15);
  }, []);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 15);
  }, [duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const cyclePlaybackRate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    
    setPlaybackRate(newRate);
    audio.playbackRate = newRate;
  }, [playbackRate]);

  const goToChapter = useCallback((index: number) => {
    setCurrentChapterIndex(index);
    setShowChapterList(false);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!hasChapters) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No audio available</h2>
        <p className="text-gray-400 mb-6">This story doesn&apos;t have any audio chapters yet.</p>
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Library
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Cover and Info */}
        <div className="lg:w-80 flex-shrink-0">
          {/* Cover */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-dark-card to-dark-elevated shadow-2xl mb-6">
            {story.cover_url ? (
              <Image
                src={story.cover_url}
                alt={story.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-pink/20 flex items-center justify-center">
                  <svg className="w-16 h-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Story Info */}
          <h1 className="text-2xl font-bold text-white mb-2">{story.title}</h1>
          <p className="text-gray-400 mb-4">{story.author}</p>
          
          {story.description && (
            <p className="text-sm text-gray-500 line-clamp-4">{story.description}</p>
          )}
        </div>

        {/* Right: Player */}
        <div className="flex-1">
          {/* Hidden audio elements */}
          <audio ref={introAudioRef} src={INTRO_SOUND_URL} preload="auto" />
          <audio ref={audioRef} src={currentChapter?.audio_url} preload="metadata" />

          {/* Current chapter info */}
          <div className="rounded-2xl bg-dark-card border border-dark-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-primary-400 font-medium uppercase tracking-wider">
                  {isPlayingIntro ? 'Taleify' : 'Now Playing'}
                </span>
                <h2 className="text-lg font-semibold text-white mt-1">
                  {isPlayingIntro ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                      Opening...
                    </span>
                  ) : (
                    `Chapter ${currentChapter.order_index + 1}: ${currentChapter.title}`
                  )}
                </h2>
              </div>
              <button
                onClick={() => setShowChapterList(!showChapterList)}
                className="p-2 rounded-lg bg-dark-elevated hover:bg-dark-border transition-colors"
                title="Show chapters"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div
              ref={progressRef}
              onClick={handleSeek}
              className="h-2 bg-dark-elevated rounded-full cursor-pointer mb-3 overflow-hidden group"
            >
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Time display */}
            <div className="flex justify-between text-sm text-gray-500 mb-6">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Previous chapter */}
              <button
                onClick={() => currentChapterIndex > 0 && setCurrentChapterIndex(prev => prev - 1)}
                disabled={currentChapterIndex === 0}
                className="p-3 rounded-full hover:bg-dark-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous chapter"
              >
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Skip backward 15s */}
              <button
                onClick={skipBackward}
                className="p-3 rounded-full hover:bg-dark-elevated transition-colors"
                title="Skip back 15 seconds"
              >
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 flex items-center justify-center shadow-lg hover:shadow-glow transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="w-8 h-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : isPlaying ? (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Skip forward 15s */}
              <button
                onClick={skipForward}
                className="p-3 rounded-full hover:bg-dark-elevated transition-colors"
                title="Skip forward 15 seconds"
              >
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </button>

              {/* Next chapter */}
              <button
                onClick={() => currentChapterIndex < chapters.length - 1 && setCurrentChapterIndex(prev => prev + 1)}
                disabled={currentChapterIndex === chapters.length - 1}
                className="p-3 rounded-full hover:bg-dark-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next chapter"
              >
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-border">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg hover:bg-dark-elevated transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1.5 bg-dark-elevated rounded-full appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              {/* Playback speed */}
              <button
                onClick={cyclePlaybackRate}
                className="px-3 py-1.5 text-sm font-medium bg-dark-elevated hover:bg-dark-border rounded-lg transition-colors text-gray-300"
              >
                {playbackRate}x
              </button>
            </div>
          </div>

          {/* Chapter list */}
          {showChapterList && (
            <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-dark-border">
                <h3 className="font-semibold text-white">Chapters</h3>
                <p className="text-sm text-gray-500">{chapters.length} chapters</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {chapters.map((chapter, index) => {
                  const chapterProgress = progressMap[chapter.id];
                  const isCurrentChapter = index === currentChapterIndex;
                  const progressPercent = chapter.duration_ms && chapterProgress
                    ? Math.min((chapterProgress / chapter.duration_ms) * 100, 100)
                    : 0;

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => goToChapter(index)}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-dark-elevated transition-colors text-left border-b border-dark-border/50 last:border-0 ${
                        isCurrentChapter ? 'bg-primary-500/10' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrentChapter
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-elevated text-gray-400'
                      }`}>
                        {isCurrentChapter && isPlaying ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          isCurrentChapter ? 'text-primary-300' : 'text-white'
                        }`}>
                          {chapter.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatDuration(chapter.duration_ms)}
                          </span>
                          {progressPercent > 0 && (
                            <div className="flex-1 h-1 bg-dark-bg rounded-full overflow-hidden max-w-24">
                              <div
                                className="h-full bg-primary-500/50 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
