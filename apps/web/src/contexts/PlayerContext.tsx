'use client';

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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

interface PlayerState {
  story: Story | null;
  chapters: Chapter[];
  currentChapterIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
}

interface PlayerContextType extends PlayerState {
  playStory: (storyId: string) => Promise<void>;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  nextChapter: () => void;
  previousChapter: () => void;
  goToChapter: (index: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

interface PlayerProviderProps {
  children: ReactNode;
  userId?: string;
}

export function PlayerProvider({ children, userId }: PlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<PlayerState>({
    story: null,
    chapters: [],
    currentChapterIndex: 0,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
  });

  const currentChapter = state.chapters[state.currentChapterIndex];

  // Save progress to Supabase
  const saveProgress = useCallback(async (chapterId: string, positionMs: number) => {
    if (!userId) return;
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase
        .from('playback_progress')
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

  // Play a story by ID
  const playStory = useCallback(async (storyId: string) => {
    // Don't reload if same story
    if (state.story?.id === storyId) {
      if (!state.isPlaying && audioRef.current) {
        audioRef.current.play();
      }
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const supabase = createSupabaseBrowserClient();

      // Fetch story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (storyError || !story) {
        console.error('Error fetching story:', storyError);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch chapters
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', storyId)
        .order('order_index', { ascending: true });

      if (chaptersError || !chapters || chapters.length === 0) {
        console.error('Error fetching chapters:', chaptersError);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch progress for chapters
      let startChapterIndex = 0;
      let startTime = 0;

      if (userId) {
        const chapterIds = chapters.map(c => c.id);
        const { data: progressData } = await supabase
          .from('playback_progress')
          .select('chapter_id, position_ms')
          .eq('user_id', userId)
          .in('chapter_id', chapterIds);

        if (progressData && progressData.length > 0) {
          // Find the most recent chapter with progress
          for (let i = chapters.length - 1; i >= 0; i--) {
            const progress = progressData.find(p => p.chapter_id === chapters[i].id);
            if (progress) {
              startChapterIndex = i;
              startTime = progress.position_ms / 1000;
              break;
            }
          }
        }
      }

      setState(prev => ({
        ...prev,
        story,
        chapters,
        currentChapterIndex: startChapterIndex,
        currentTime: startTime,
        isLoading: false,
        isPlaying: true,
      }));

      // Wait for state to update then play
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = startTime;
          audioRef.current.play().catch(() => {});
        }
      }, 100);

    } catch (error) {
      console.error('Error playing story:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.story?.id, state.isPlaying, userId]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
      if (currentChapter) {
        debouncedSaveProgress(currentChapter.id, Math.floor(audio.currentTime * 1000));
      }
    };

    const handleLoadStart = () => setState(prev => ({ ...prev, isLoading: true }));
    const handleCanPlay = () => setState(prev => ({ ...prev, isLoading: false }));
    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));

    const handleEnded = () => {
      setState(prev => {
        if (prev.currentChapterIndex < prev.chapters.length - 1) {
          return { ...prev, currentChapterIndex: prev.currentChapterIndex + 1, currentTime: 0 };
        }
        return { ...prev, isPlaying: false };
      });
    };

    const handleError = () => {
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentChapter, debouncedSaveProgress]);

  // Load new chapter when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentChapter) return;

    audio.src = currentChapter.audio_url;
    audio.load();

    if (state.isPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentChapter?.id]);

  // Apply volume and playback rate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = state.isMuted ? 0 : state.volume;
    audio.playbackRate = state.playbackRate;
  }, [state.volume, state.isMuted, state.playbackRate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentChapter) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [state.isPlaying, currentChapter]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const skipForward = useCallback((seconds = 15) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(state.duration, audio.currentTime + seconds);
  }, [state.duration]);

  const skipBackward = useCallback((seconds = 15) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - seconds);
  }, []);

  const nextChapter = useCallback(() => {
    if (state.currentChapterIndex < state.chapters.length - 1) {
      setState(prev => ({ ...prev, currentChapterIndex: prev.currentChapterIndex + 1, currentTime: 0 }));
    }
  }, [state.currentChapterIndex, state.chapters.length]);

  const previousChapter = useCallback(() => {
    if (state.currentChapterIndex > 0) {
      setState(prev => ({ ...prev, currentChapterIndex: prev.currentChapterIndex - 1, currentTime: 0 }));
    }
  }, [state.currentChapterIndex]);

  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < state.chapters.length) {
      setState(prev => ({ ...prev, currentChapterIndex: index, currentTime: 0 }));
    }
  }, [state.chapters.length]);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playStory,
        togglePlay,
        pause,
        seek,
        skipForward,
        skipBackward,
        nextChapter,
        previousChapter,
        goToChapter,
        setVolume,
        toggleMute,
        setPlaybackRate,
        audioRef,
      }}
    >
      {children}
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
    </PlayerContext.Provider>
  );
}
