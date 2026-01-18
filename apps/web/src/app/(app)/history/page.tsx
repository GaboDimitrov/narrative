import { createSupabaseServerClient } from '@/lib/supabase/server';
import { HistoryCard } from '@/components/HistoryCard';

export const dynamic = 'force-dynamic';

interface ProgressWithChapterAndStory {
  id: string;
  position_ms: number;
  updated_at: string;
  chapter: {
    id: string;
    title: string;
    order_index: number;
    duration_ms: number | null;
    story: {
      id: string;
      title: string;
      author: string;
      cover_url: string | null;
    };
  };
}

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's playback progress with chapter and story info
  const { data: progressData, error } = await (supabase
    .from('playback_progress') as any)
    .select(`
      id,
      position_ms,
      updated_at,
      chapter:chapters (
        id,
        title,
        order_index,
        duration_ms,
        story:stories (
          id,
          title,
          author,
          cover_url
        )
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching history:', error);
  }

  // Group by story and get most recent progress for each
  const storyProgressMap = new Map<string, ProgressWithChapterAndStory>();
  
  (progressData || []).forEach((progress: any) => {
    const chapter = progress.chapter;
    if (!chapter?.story) return;
    
    const storyId = chapter.story.id;
    if (!storyProgressMap.has(storyId)) {
      storyProgressMap.set(storyId, {
        id: progress.id,
        position_ms: progress.position_ms,
        updated_at: progress.updated_at,
        chapter: {
          id: chapter.id,
          title: chapter.title,
          order_index: chapter.order_index,
          duration_ms: chapter.duration_ms,
          story: chapter.story,
        },
      });
    }
  });

  const historyItems = Array.from(storyProgressMap.values());

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Listening History</h1>
        <p className="text-gray-400">Continue where you left off</p>
      </div>

      {/* History List */}
      {historyItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No listening history</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Start listening to audiobooks and they&apos;ll appear here so you can easily continue.
          </p>
          <a
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:shadow-glow transition-all"
          >
            Browse Library
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <HistoryCard
              key={item.chapter.story.id}
              storyId={item.chapter.story.id}
              storyTitle={item.chapter.story.title}
              author={item.chapter.story.author}
              coverUrl={item.chapter.story.cover_url}
              chapterTitle={item.chapter.title}
              chapterIndex={item.chapter.order_index}
              positionMs={item.position_ms}
              durationMs={item.chapter.duration_ms}
              updatedAt={item.updated_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
