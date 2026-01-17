import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { Database } from '@taleify/supabase';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Story = Database['public']['Tables']['stories']['Row'];
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const HORIZONTAL_CARD_WIDTH = 140;

interface ContinueListeningItem {
  story: Story;
  progress: number;
}

export function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [continueListening, setContinueListening] = useState<ContinueListeningItem[]>([]);
  const [favorites, setFavorites] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchLibrary();
    }, [])
  );

  async function fetchLibrary() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progressData } = await supabase
        .from('playback_progress')
        .select(`
          position_ms,
          chapter_id,
          chapters!inner (
            story_id,
            stories!inner (*)
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (progressData) {
        const uniqueStories = new Map<string, ContinueListeningItem>();
        progressData.forEach((item: any) => {
          const story = item.chapters.stories;
          if (!uniqueStories.has(story.id)) {
            uniqueStories.set(story.id, {
              story,
              progress: item.position_ms,
            });
          }
        });
        setContinueListening(Array.from(uniqueStories.values()));
      }

      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('stories (*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesData) {
        setFavorites(favoritesData.map((f: any) => f.stories));
      }
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderHorizontalCard = (item: ContinueListeningItem) => (
    <TouchableOpacity
      key={item.story.id}
      style={styles.horizontalCard}
      onPress={() => navigation.navigate('StoryDetail', { story: item.story })}
      activeOpacity={0.85}
    >
      <View style={styles.horizontalImageWrapper}>
        {item.story.cover_url ? (
          <Image source={{ uri: item.story.cover_url }} style={styles.horizontalCover} />
        ) : (
          <View style={[styles.horizontalCover, styles.placeholder]}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.miniPlayBtn}>
            <Text style={styles.miniPlayIcon}>▶</Text>
          </View>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '45%' }]} />
      </View>
      <Text style={styles.horizontalTitle} numberOfLines={2}>
        {item.story.title}
      </Text>
      <Text style={styles.horizontalAuthor} numberOfLines={1}>
        {item.story.author}
      </Text>
    </TouchableOpacity>
  );

  const renderVerticalCard = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.verticalCard}
      onPress={() => navigation.navigate('StoryDetail', { story: item })}
      activeOpacity={0.85}
    >
      {item.cover_url ? (
        <Image source={{ uri: item.cover_url }} style={styles.verticalCover} />
      ) : (
        <View style={[styles.verticalCover, styles.placeholder]}>
          <Text style={styles.placeholderTextSmall}>📚</Text>
        </View>
      )}
      <View style={styles.verticalInfo}>
        <Text style={styles.verticalTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.verticalAuthor} numberOfLines={1}>
          by {item.author}
        </Text>
      </View>
      <View style={styles.playBtn}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Continue Listening */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Listening</Text>
          {continueListening.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {continueListening.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎧</Text>
            <Text style={styles.emptyTitle}>No stories in progress</Text>
            <Text style={styles.emptySubtitle}>Start listening to see your progress here</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {continueListening.map(renderHorizontalCard)}
          </ScrollView>
        )}
      </View>

      {/* Favorites */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favorites</Text>
          {favorites.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>Tap the heart on stories you love</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderVerticalCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  horizontalCard: {
    width: HORIZONTAL_CARD_WIDTH,
    marginRight: spacing.md,
  },
  horizontalImageWrapper: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  horizontalCover: {
    width: HORIZONTAL_CARD_WIDTH,
    height: 180,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: borderRadius.lg,
  },
  miniPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  miniPlayIcon: {
    color: colors.textPrimary,
    fontSize: 16,
    marginLeft: 2,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  horizontalTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  horizontalAuthor: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  placeholderTextSmall: {
    fontSize: 32,
  },
  verticalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verticalCover: {
    width: 60,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundElevated,
  },
  verticalInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  verticalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  verticalAuthor: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
