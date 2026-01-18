import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { StoryPlayer } from '@/components/StoryPlayer';

export const dynamic = 'force-dynamic';

interface PlayPageProps {
  params: Promise<{ storyId: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { storyId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch story with chapters
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (storyError || !story) {
    notFound();
  }

  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', storyId)
    .order('order_index', { ascending: true });

  if (chaptersError) {
    console.error('Error fetching chapters:', chaptersError);
  }

  // Fetch user's progress for this story's chapters
  const chapterIds = (chapters || []).map(c => c.id);
  let progressMap: Record<string, number> = {};

  if (chapterIds.length > 0) {
    const { data: progressData } = await supabase
      .from('playback_progress')
      .select('chapter_id, position_ms')
      .eq('user_id', user.id)
      .in('chapter_id', chapterIds);

    if (progressData) {
      progressMap = progressData.reduce((acc, p) => {
        acc[p.chapter_id] = p.position_ms;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  return (
    <StoryPlayer
      key={story.id}
      story={story}
      chapters={chapters || []}
      progressMap={progressMap}
      userId={user.id}
    />
  );
}
