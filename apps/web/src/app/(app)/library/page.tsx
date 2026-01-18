import { createSupabaseServerClient } from '@/lib/supabase/server';
import { StoryCard } from '@/components/StoryCard';

export const dynamic = 'force-dynamic';

interface Story {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  chapters: { count: number }[];
}

export default async function LibraryPage() {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      author,
      description,
      cover_url,
      chapters:chapters(count)
    `)
    .order('created_at', { ascending: false });

  const stories = data as Story[] | null;

  if (error) {
    console.error('Error fetching stories:', error);
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Library</h1>
        <p className="text-gray-400">Explore all available audiobooks</p>
      </div>

      {/* Stories Grid */}
      {!stories || stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No stories yet</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            The library is empty. Check back soon for new audiobooks!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              id={story.id}
              title={story.title}
              author={story.author}
              description={story.description}
              coverUrl={story.cover_url}
              chapterCount={story.chapters?.[0]?.count || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
