import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../hooks/usePlayer';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'Player'>;

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width - 100;

export function PlayerScreen() {
  const route = useRoute<ScreenProps['route']>();
  const { chapter, story, startPosition } = route.params;

  const {
    isSetup,
    playChapter,
    play,
    pause,
    seekTo,
    skipForward,
    skipBackward,
    isPlaying,
    isBuffering,
    progress,
    saveProgress,
  } = usePlayer();

  useEffect(() => {
    if (isSetup) {
      playChapter(
        chapter.id,
        chapter.title,
        story.title,
        chapter.audio_url,
        story.cover_url || undefined,
        startPosition
      );
    }

    return () => {
      saveProgress();
    };
  }, [isSetup]);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (!isSetup) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Setting up player...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Artwork */}
      <View style={styles.artworkWrapper}>
        <View style={styles.artworkShadow}>
          {story.cover_url ? (
            <Image source={{ uri: story.cover_url }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.placeholderArtwork]}>
              <Text style={styles.placeholderText}>📚</Text>
            </View>
          )}
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.chapterTitle} numberOfLines={2}>
          {chapter.title}
        </Text>
        <Text style={styles.storyTitle} numberOfLines={1}>
          {story.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          by {story.author}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <Slider
          style={styles.slider}
          value={progress.position}
          minimumValue={0}
          maximumValue={progress.duration || 1}
          onSlidingComplete={seekTo}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.backgroundElevated}
          thumbTintColor={colors.accentLight}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(progress.position)}</Text>
          <Text style={styles.time}>{formatTime(progress.duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={skipBackward} style={styles.skipBtn}>
          <Text style={styles.skipIcon}>↺</Text>
          <Text style={styles.skipLabel}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isPlaying ? pause : play}
          style={styles.playBtn}
          disabled={isBuffering}
          activeOpacity={0.8}
        >
          {isBuffering ? (
            <ActivityIndicator size="large" color={colors.textPrimary} />
          ) : (
            <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={skipForward} style={styles.skipBtn}>
          <Text style={styles.skipIcon}>↻</Text>
          <Text style={styles.skipLabel}>15</Text>
        </TouchableOpacity>
      </View>

      {/* Extra Controls */}
      <View style={styles.extraControls}>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraBtnText}>1.0x</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraBtnIcon}>☾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraBtnIcon}>☰</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.lg,
    fontSize: typography.sizes.md,
  },
  artworkWrapper: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  artworkShadow: {
    borderRadius: borderRadius.xxl,
    ...shadows.glow,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.backgroundCard,
  },
  placeholderArtwork: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 100,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  chapterTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  storyTitle: {
    fontSize: typography.sizes.md,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  author: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.sm,
  },
  time: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  skipBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipIcon: {
    color: colors.textPrimary,
    fontSize: 22,
  },
  skipLabel: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: -4,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow,
  },
  playIcon: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  extraBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  extraBtnText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  extraBtnIcon: {
    color: colors.textSecondary,
    fontSize: typography.sizes.lg,
  },
});
