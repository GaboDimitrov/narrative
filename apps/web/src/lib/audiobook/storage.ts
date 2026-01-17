import { createClient } from '@supabase/supabase-js';
import { Database } from '@taleify/supabase';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function uploadChapterAudio(
  storyId: string,
  chapterNumber: number,
  audioBuffer: Buffer
): Promise<string> {
  const supabase = createAdminClient();
  const filename = `chapter_${String(chapterNumber).padStart(2, '0')}.mp3`;
  const path = `${storyId}/${filename}`;

  const { error } = await supabase.storage
    .from('audiobooks')
    .upload(path, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload audio: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('audiobooks')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

export async function createStoryRecord(
  storyId: string,
  title: string,
  author: string,
  description?: string,
  coverUrl?: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('stories').insert({
    id: storyId,
    title,
    author,
    description: description || 'AI-generated audiobook with character voices',
    cover_url: coverUrl || null,
  });

  if (error) {
    throw new Error(`Failed to create story record: ${error.message}`);
  }
}

export async function createChapterRecord(
  storyId: string,
  chapterNumber: number,
  title: string,
  audioUrl: string,
  durationMs?: number
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('chapters').insert({
    story_id: storyId,
    title,
    order_index: chapterNumber,
    audio_url: audioUrl,
    duration_ms: durationMs || null,
  });

  if (error) {
    throw new Error(`Failed to create chapter record: ${error.message}`);
  }
}
