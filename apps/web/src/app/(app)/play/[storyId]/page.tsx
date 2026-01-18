import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { StoryPlayer } from '@/components/StoryPlayer';

export const dynamic = 'force-dynamic';

interface PlayPageProps {
  params: Promise<{ storyId: string }>;
}

interface Story {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
}

interface Chapter {
  id: string;
  story_id: string;
  title: string;
  order_index: number;
  audio_url: string;
  duration_ms: number | null;
  created_at: string;
}

interface Progress {
  chapter_id: string;
  position_ms: number;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { storyId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch story with chapters
  const { data: storyData, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (storyError || !storyData) {
    notFound();
  }

  const story = storyData as Story;

  const { data: chaptersData, error: chaptersError } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', storyId)
    .order('order_index', { ascending: true });

  if (chaptersError) {
    console.error('Error fetching chapters:', chaptersError);
  }

  const chapters: Chapter[] = (chaptersData as Chapter[]) || [];

  // Fetch user's progress for this story's chapters
  const chapterIds = chapters.map((c: Chapter) => c.id);
  let progressMap: Record<string, number> = {};

  if (chapterIds.length > 0) {
    const { data: progressData } = await supabase
      .from('playback_progress')
      .select('chapter_id, position_ms')
      .eq('user_id', user.id)
      .in('chapter_id', chapterIds);

    if (progressData) {
      const progress = progressData as Progress[];
      progressMap = progress.reduce((acc: Record<string, number>, p: Progress) => {
        acc[p.chapter_id] = p.position_ms;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  return (
    <StoryPlayer
      key={story.id}
      story={story}
      chapters={chapters}
      progressMap={progressMap}
      userId={user.id}
    />
  );
}
