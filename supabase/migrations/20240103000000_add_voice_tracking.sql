-- Add voice tracking to stories table
-- Allows tracking audiobooks created with custom/cloned voices

-- Add voice_id column to track which voice was used
ALTER TABLE stories ADD COLUMN IF NOT EXISTS voice_id TEXT;

-- Add creator_id column to track who created the audiobook
ALTER TABLE stories ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add voice_name column for display purposes
ALTER TABLE stories ADD COLUMN IF NOT EXISTS voice_name TEXT;

-- Create index for faster lookups by creator
CREATE INDEX IF NOT EXISTS stories_creator_id_idx ON stories(creator_id);

-- Create index for finding stories with custom voices
CREATE INDEX IF NOT EXISTS stories_voice_id_idx ON stories(voice_id);

-- RLS policy: users can see their own voice-created stories
CREATE POLICY "Users can read own voice stories" ON stories
  FOR SELECT USING (creator_id = auth.uid() OR creator_id IS NULL);

-- Comment: Stories with a voice_id represent audiobooks created with a custom/cloned voice
-- The voice_id typically refers to an ElevenLabs voice ID
