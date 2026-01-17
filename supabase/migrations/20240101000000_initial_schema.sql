-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on story_id for faster lookups
CREATE INDEX IF NOT EXISTS chapters_story_id_idx ON chapters(story_id);
CREATE INDEX IF NOT EXISTS chapters_order_idx ON chapters(story_id, order_index);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);

-- Create playback_progress table
CREATE TABLE IF NOT EXISTS playback_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  position_ms INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS playback_progress_user_id_idx ON playback_progress(user_id);

-- Create waitlist_emails table
CREATE TABLE IF NOT EXISTS waitlist_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE playback_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories (public read)
CREATE POLICY "Public read stories" ON stories
  FOR SELECT USING (true);

-- RLS Policies for chapters (public read)
CREATE POLICY "Public read chapters" ON chapters
  FOR SELECT USING (true);

-- RLS Policies for favorites (user manages their own)
CREATE POLICY "Users manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for playback_progress (user manages their own)
CREATE POLICY "Users manage own progress" ON playback_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for waitlist_emails (anonymous insert, no read)
CREATE POLICY "Anyone can insert waitlist" ON waitlist_emails
  FOR INSERT WITH CHECK (true);
