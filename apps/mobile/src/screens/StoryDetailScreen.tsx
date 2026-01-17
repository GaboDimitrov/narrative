import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { Database } from '@taleify/supabase';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Story = Database['public']['Tables']['stories']['Row'];
type Chapter = Database['public']['Tables']['chapters']['Row'];
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenProps = NativeStackScreenProps<RootStackParamList, 'StoryDetail'>;

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.5;

export function StoryDetailScreen() {
  const route = useRoute<ScreenProps['route']>();
  const navigation = useNavigation<NavigationProp>();
  const { story } = route.params;
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchChapters();
    checkFavorite();
  }, []);

  async function fetchChapters() {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', story.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkFavorite() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('story_id', story.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  }

  async function toggleFavorite() {
    setFavoriteLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('story_id', story.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, story_id: story.id });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function playChapter(chapter: Chapter) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let startPosition = 0;

      if (user) {
        const { data } = await supabase
          .from('playback_progress')
          .select('position_ms')
          .eq('user_id', user.id)
          .eq('chapter_id', chapter.id)
          .single();

        if (data) {
          startPosition = data.position_ms;
        }
      }

      navigation.navigate('Player', {
        chapter,
        story,
        startPosition,
      });
    } catch (error) {
      console.error('Error loading chapter progress:', error);
      navigation.navigate('Player', {
        chapter,
        story,
        startPosition: 0,
      });
    }
  }

  function playFirstChapter() {
    if (chapters.length > 0) {
      playChapter(chapters[0]);
    }
  }

  function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes} min`;
  }

  function getTotalDuration(): string {
    const totalMs = chapters.reduce((sum, ch) => sum + (ch.duration_ms || 0), 0);
    return formatDuration(totalMs);
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {story.cover_url ? (
            <Image source={{ uri: story.cover_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.placeholderHero]}>
              <Text style={styles.placeholderText}>📚</Text>
            </View>
          )}
          <View style={styles.heroGradient} />
          
          {/* Floating Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.headerBtnIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerBtn}>
                <Text style={styles.headerBtnIcon}>↗</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerBtn}
                onPress={toggleFavorite}
                disabled={favoriteLoading}
              >
                <Text style={[
                  styles.headerBtnIcon, 
                  isFavorite && styles.favoriteActive
                ]}>
                  {isFavorite ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Result Badge */}
          <View style={styles.resultBadge}>
            <Text style={styles.resultText}>Audiobook</Text>
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Description */}
          {story.description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.description}>{story.description}</Text>
            </View>
          )}

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{story.author}</Text>
              <Text style={styles.metaLabel}>Author</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{chapters.length}</Text>
              <Text style={styles.metaLabel}>Chapters</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{getTotalDuration()}</Text>
              <Text style={styles.metaLabel}>Duration</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnIcon}>📋</Text>
              <Text style={styles.secondaryBtnText}>Copy Info</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnIcon}>⬇</Text>
              <Text style={styles.secondaryBtnText}>Download</Text>
            </TouchableOpacity>
          </View>

          {/* Main CTA */}
          <TouchableOpacity 
            style={styles.mainCta}
            onPress={playFirstChapter}
            activeOpacity={0.85}
            disabled={chapters.length === 0}
          >
            <Text style={styles.mainCtaText}>
              {loading ? 'Loading...' : 'Start Listening'}
            </Text>
          </TouchableOpacity>

          {/* Chapters List */}
          <View style={styles.chaptersSection}>
            <Text style={styles.chaptersTitle}>All Chapters</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
            ) : chapters.length === 0 ? (
              <Text style={styles.emptyText}>No chapters available</Text>
            ) : (
              chapters.map((chapter, index) => (
                <TouchableOpacity
                  key={chapter.id}
                  style={styles.chapterRow}
                  onPress={() => playChapter(chapter)}
                  activeOpacity={0.7}
                >
                  <View style={styles.chapterIndex}>
                    <Text style={styles.chapterIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterTitle} numberOfLines={1}>
                      {chapter.title}
                    </Text>
                    {chapter.duration_ms && (
                      <Text style={styles.chapterDuration}>
                        {formatDuration(chapter.duration_ms)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.playBtn}>
                    <Text style={styles.playBtnIcon}>▶</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderHero: {
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(to bottom, transparent 0%, rgba(15,15,26,0.8) 100%)',
  },
  headerActions: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnIcon: {
    color: colors.textPrimary,
    fontSize: 20,
  },
  favoriteActive: {
    color: colors.accentPink,
  },
  resultBadge: {
    position: 'absolute',
    top: 60,
    right: 70,
    backgroundColor: colors.accentPink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  resultText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  contentCard: {
    marginTop: -spacing.xxl,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
  },
  descriptionBox: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  metaDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnIcon: {
    fontSize: 16,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  mainCta: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.glow,
  },
  mainCtaText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  chaptersSection: {
    marginTop: spacing.md,
  },
  chaptersTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  chapterIndexText: {
    color: colors.accent,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  chapterDuration: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnIcon: {
    color: colors.textPrimary,
    fontSize: 12,
    marginLeft: 2,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xxl,
    fontStyle: 'italic',
  },
});
