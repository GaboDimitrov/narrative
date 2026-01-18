import { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { Database } from '@taleify/supabase';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Story = Database['public']['Tables']['stories']['Row'];
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;
const CAROUSEL_CARD_WIDTH = width * 0.4;

const CATEGORIES = ['All', 'Fiction', 'Mystery', 'Fantasy', 'Sci-Fi'];

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [stories, setStories] = useState<Story[]>([]);
  const [voiceStories, setVoiceStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchStories();
    fetchVoiceStories();
  }, []);

  async function fetchStories() {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVoiceStories() {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .not('voice_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        // Silently fail if voice_id column doesn't exist yet
        if (error.message?.includes('voice_id') || error.code === '42703') {
          console.log('Voice columns not yet available');
        } else {
          console.error('Error fetching voice stories:', error);
        }
      } else {
        setVoiceStories(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch voice stories:', error);
    } finally {
      setVoiceLoading(false);
    }
  }

  const renderStory = ({ item, index }: { item: Story; index: number }) => (
    <TouchableOpacity
      style={[
        styles.card,
        index % 2 === 0 ? styles.cardLeft : styles.cardRight,
      ]}
      onPress={() => navigation.navigate('StoryDetail', { story: item })}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrapper}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholderCover]}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
        <View style={styles.imageOverlay} />
        <TouchableOpacity style={styles.favoriteBtn}>
          <Text style={styles.favoriteIcon}>♡</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* My Voice Section - Only show if there are voice stories */}
      {!voiceLoading && voiceStories.length > 0 && (
        <>
          {/* My Voice Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.voiceIcon}>🎤</Text>
              <Text style={styles.sectionTitle}>My Voice</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* My Voice Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            decelerationRate="fast"
            snapToInterval={CAROUSEL_CARD_WIDTH + spacing.md}
          >
            {voiceStories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.carouselCard}
                onPress={() => navigation.navigate('StoryDetail', { story })}
                activeOpacity={0.85}
              >
                <View style={styles.carouselImageWrapper}>
                  {story.cover_url ? (
                    <Image source={{ uri: story.cover_url }} style={styles.cover} />
                  ) : (
                    <View style={[styles.cover, styles.placeholderCover]}>
                      <Text style={styles.placeholderText}>📚</Text>
                    </View>
                  )}
                  <View style={styles.imageOverlay} />
                  <View style={styles.voiceBadge}>
                    <Text style={styles.voiceBadgeText}>🎤 MY VOICE</Text>
                  </View>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.title} numberOfLines={2}>{story.title}</Text>
                  <Text style={styles.author} numberOfLines={1}>{story.author}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Explore Stories Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore Stories</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Stories Grid */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={styles.emptyTitle}>No stories found</Text>
              <Text style={styles.emptySubtitle}>Check back for new content</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoriesWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  categories: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.backgroundCard,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  categoryTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  voiceIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  carouselContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  carouselCard: {
    width: CAROUSEL_CARD_WIDTH,
    marginRight: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.accentPink + '30',
    ...shadows.md,
  },
  carouselImageWrapper: {
    position: 'relative',
    aspectRatio: 3/4,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  cardLeft: {
    marginRight: spacing.sm,
  },
  cardRight: {
    marginLeft: spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
    aspectRatio: 1,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  voiceBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accentPink,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  voiceBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  cardInfo: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  author: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
