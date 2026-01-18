import { useEffect, useState, useCallback, useRef } from 'react';
import TrackPlayer, { 
  State, 
  usePlaybackState, 
  useProgress,
  Track,
  Event,
} from 'react-native-track-player';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { supabase } from '../lib/supabase';
import { setupPlayer } from '../services/trackPlayerService';

// Intro sound that plays before every story (Black Mirror style)
const INTRO_SOUND = require('../../assets/intro-sound.mp3');
const INTRO_TRACK_ID = '__intro__';

export function usePlayer() {
  const [isSetup, setIsSetup] = useState(false);
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const progressSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const currentChapterId = useRef<string | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        const isPlayerSetup = await setupPlayer();
        setIsSetup(isPlayerSetup);
        console.log('Track player setup complete');
      } catch (error) {
        console.error('Error setting up track player:', error);
      }
    }
    setup();

    return () => {
      if (progressSaveInterval.current) {
        clearInterval(progressSaveInterval.current);
      }
    };
  }, []);

  const saveProgress = useCallback(async (chapterId: string, positionMs: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('playback_progress')
        .upsert({
          user_id: user.id,
          chapter_id: chapterId,
          position_ms: Math.floor(positionMs),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,chapter_id',
        });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, []);

  const startProgressTracking = useCallback((chapterId: string) => {
    currentChapterId.current = chapterId;
    
    if (progressSaveInterval.current) {
      clearInterval(progressSaveInterval.current);
    }

    progressSaveInterval.current = setInterval(async () => {
      if (currentChapterId.current) {
        const { position } = await TrackPlayer.getProgress();
        saveProgress(currentChapterId.current, position * 1000);
      }
    }, 10000);
  }, [saveProgress]);

  const stopProgressTracking = useCallback(async () => {
    if (progressSaveInterval.current) {
      clearInterval(progressSaveInterval.current);
      progressSaveInterval.current = null;
    }
    
    if (currentChapterId.current) {
      const { position } = await TrackPlayer.getProgress();
      await saveProgress(currentChapterId.current, position * 1000);
    }
  }, [saveProgress]);

  const playChapter = useCallback(async (
    chapterId: string,
    title: string,
    storyTitle: string,
    audioUrl: string,
    coverUrl?: string,
    startPosition?: number
  ) => {
    try {
      console.log('Playing audio from:', audioUrl);
      
      // Download file to cache first for better playback
      let localUri = audioUrl;
      if (audioUrl.startsWith('http')) {
        const filename = audioUrl.split('/').pop() || 'audio.mp3';
        const cacheUri = `${FileSystem.cacheDirectory}${chapterId}_${filename}`;
        
        const fileInfo = await FileSystem.getInfoAsync(cacheUri);
        if (fileInfo.exists) {
          console.log('Using cached audio:', cacheUri);
          localUri = cacheUri;
        } else {
          console.log('Downloading audio to cache...');
          const downloadResult = await FileSystem.downloadAsync(audioUrl, cacheUri);
          console.log('Download complete:', downloadResult.uri);
          localUri = downloadResult.uri;
        }
      }

      // Reset player
      await TrackPlayer.reset();
      
      // Load intro sound asset
      const introAsset = Asset.fromModule(INTRO_SOUND);
      await introAsset.downloadAsync();
      console.log('Intro sound loaded:', introAsset.localUri);

      // Add intro track first (Black Mirror style opening)
      const introTrack: Track = {
        id: INTRO_TRACK_ID,
        url: introAsset.localUri || introAsset.uri,
        title: 'Taleify',
        artist: 'Opening',
      };
      await TrackPlayer.add(introTrack);
      console.log('Intro track added');

      // Add the actual chapter track
      const chapterTrack: Track = {
        id: chapterId,
        url: localUri,
        title: title,
        artist: storyTitle,
        artwork: coverUrl,
      };
      await TrackPlayer.add(chapterTrack);
      console.log('Chapter track added:', chapterTrack.title);

      // Listen for track change to handle seeking and progress tracking
      const pendingStartPosition = startPosition;
      const pendingChapterId = chapterId;
      
      const trackChangeListener = TrackPlayer.addEventListener(
        Event.PlaybackActiveTrackChanged,
        async (event) => {
          // When we switch to the chapter track (from intro)
          if (event.track?.id === pendingChapterId) {
            console.log('Switched to chapter track');
            
            // Seek to saved position if provided
            if (pendingStartPosition && pendingStartPosition > 0) {
              console.log('Seeking to saved position:', pendingStartPosition / 1000, 'seconds');
              await TrackPlayer.seekTo(pendingStartPosition / 1000);
            }
            
            // Start progress tracking for the chapter
            startProgressTracking(pendingChapterId);
            
            // Remove this listener after handling
            trackChangeListener.remove();
          }
        }
      );

      // Start playback (will start with intro)
      console.log('Starting playback with intro...');
      await TrackPlayer.play();
      console.log('Playback started');
      
    } catch (error) {
      console.error('Error playing chapter:', error);
    }
  }, [startProgressTracking]);

  const play = useCallback(async () => {
    await TrackPlayer.play();
  }, []);

  const pause = useCallback(async () => {
    await TrackPlayer.pause();
    await stopProgressTracking();
  }, [stopProgressTracking]);

  const seekTo = useCallback(async (seconds: number) => {
    await TrackPlayer.seekTo(seconds);
  }, []);

  const skipForward = useCallback(async () => {
    const { position } = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(position + 15);
  }, []);

  const skipBackward = useCallback(async () => {
    const { position } = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(Math.max(0, position - 15));
  }, []);

  const clearCache = useCallback(async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        const audioFiles = files.filter(f => f.endsWith('.mp3'));
        for (const file of audioFiles) {
          await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
        }
        console.log(`Cleared ${audioFiles.length} cached audio files`);
        return audioFiles.length;
      }
      return 0;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return 0;
    }
  }, []);

  // Determine playing/buffering state from playback state
  const isPlaying = playbackState.state === State.Playing;
  const isBuffering = playbackState.state === State.Buffering || playbackState.state === State.Loading;

  return {
    isSetup,
    playChapter,
    play,
    pause,
    seekTo,
    skipForward,
    skipBackward,
    isPlaying,
    isBuffering,
    progress: { 
      position: progress.position, 
      duration: progress.duration 
    },
    saveProgress: stopProgressTracking,
    clearCache,
  };
}
