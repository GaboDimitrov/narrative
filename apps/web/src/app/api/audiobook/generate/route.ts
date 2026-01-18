import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import ffmpeg from 'fluent-ffmpeg';

// Use system ffmpeg (installed via: brew install ffmpeg)
ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg');

export const maxDuration = 300;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Default narrator voice ID - Daniel - British male, deep authoritative news presenter style
const DEFAULT_NARRATOR_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9';

// ElevenLabs voice IDs - selected for maximum distinctiveness
const VOICE_POOL: Record<string, string> = {
  // Narrator: Daniel - British male, deep authoritative news presenter style
  narrator: DEFAULT_NARRATOR_VOICE_ID,
  // Young female: Alice - British female, youthful and clear
  young_female: 'Xb7hH8MSUJpSbSDYk0k2',
  // Mature female: Sarah - American female, warm and expressive
  mature_female: 'EXAVITQu4vr4xnSDxMaL',
  // Elderly female: Lily - British female, gentle and wise
  elderly_female: 'pFZP5JQG7iQjIQuC4Bku',
  // Young male: James - Australian male, energetic
  young_male: 'ZQe5CZNOzWyzPSCn5a3c',
  // Mature male: Clyde - American male, deep gravelly war veteran style
  mature_male: '2EiwWnXFnvU5JabPnv8n',
  // Elderly male: George - British male, warm grandfatherly narration
  elderly_male: 'JBFqnCBsd6RMkjVDRZzb',
  // Child: Matilda - American female, lighter youthful voice
  child: 'XrExE9yKIg1WjnnlVkGX',
  // Neutral fallback: Daniel (same as narrator)
  neutral: DEFAULT_NARRATOR_VOICE_ID,
};

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
}

/**
 * Checks if a string looks like an ElevenLabs voice ID (alphanumeric, ~20 chars).
 */
function looksLikeVoiceId(input: string): boolean {
  // ElevenLabs voice IDs are typically 20 alphanumeric characters
  return /^[a-zA-Z0-9]{15,25}$/.test(input.trim());
}

/**
 * Validates a voice ID by checking if it exists in ElevenLabs.
 */
async function validateVoiceId(voiceId: string): Promise<boolean> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches available voices from ElevenLabs and finds a voice by name.
 * Returns the voice ID if found, or null if not found.
 */
async function findElevenLabsVoiceByName(voiceName: string): Promise<{ voiceId: string | null; availableVoices: string[] }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { voiceId: null, availableVoices: [] };
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch ElevenLabs voices:', response.status);
      return { voiceId: null, availableVoices: [] };
    }

    const data = await response.json();
    const voices: ElevenLabsVoice[] = data.voices || [];
    
    // Find voice by name (case-insensitive)
    const normalizedName = voiceName.toLowerCase().trim();
    const matchedVoice = voices.find(
      (v) => v.name.toLowerCase() === normalizedName
    );

    return {
      voiceId: matchedVoice?.voice_id || null,
      availableVoices: voices.map((v) => v.name),
    };
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    return { voiceId: null, availableVoices: [] };
  }
}

/**
 * Resolves a voice input (name or ID) to a valid voice ID.
 */
async function resolveVoiceInput(input: string): Promise<{ voiceId: string | null; warning?: string }> {
  const trimmedInput = input.trim();
  
  // Check if it looks like a voice ID
  if (looksLikeVoiceId(trimmedInput)) {
    console.log(`Input "${trimmedInput}" looks like a voice ID, validating...`);
    const isValid = await validateVoiceId(trimmedInput);
    if (isValid) {
      return { voiceId: trimmedInput };
    } else {
      return { 
        voiceId: null, 
        warning: `Voice ID "${trimmedInput}" is not valid or not accessible with your API key.` 
      };
    }
  }
  
  // Otherwise, search by name
  console.log(`Searching for voice by name: "${trimmedInput}"`);
  const { voiceId, availableVoices } = await findElevenLabsVoiceByName(trimmedInput);
  
  if (voiceId) {
    return { voiceId };
  }
  
  return {
    voiceId: null,
    warning: `Voice "${trimmedInput}" was not found in ElevenLabs. Using default narrator voice instead. Available voices include: ${availableVoices.slice(0, 10).join(', ')}${availableVoices.length > 10 ? '...' : ''}`,
  };
}

interface Chapter {
  number: number;
  title: string;
  text: string;
}

interface TextSegment {
  speaker: string;
  text: string;
  voiceId: string;
}

interface GeneratedChapter {
  number: number;
  title: string;
  audioUrl: string;
  characters: string[];
  segmentCount: number;
}

/**
 * Finds the first MP3 frame sync in a buffer.
 * MP3 frames start with 0xFF followed by 0xE0-0xFF (11 sync bits).
 */
function findFirstMp3Frame(buffer: Buffer): number {
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === 0xFF && (buffer[i + 1] & 0xE0) === 0xE0) {
      return i;
    }
  }
  return -1;
}

/**
 * Strips ID3v2 header from an MP3 buffer and returns audio data starting from first frame.
 * ID3v2 tags start with "ID3" and have a size field.
 */
function stripId3Header(buffer: Buffer): Buffer {
  // Check for ID3v2 header
  if (buffer.length >= 10 && 
      buffer[0] === 0x49 && // 'I'
      buffer[1] === 0x44 && // 'D'
      buffer[2] === 0x33) { // '3'
    // ID3v2 size is stored in 4 bytes (synchsafe integer)
    const size = ((buffer[6] & 0x7F) << 21) |
                 ((buffer[7] & 0x7F) << 14) |
                 ((buffer[8] & 0x7F) << 7) |
                 (buffer[9] & 0x7F);
    const id3End = 10 + size;
    
    // Find first MP3 frame after ID3 tag
    const frameStart = findFirstMp3Frame(buffer.subarray(id3End));
    if (frameStart >= 0) {
      return buffer.subarray(id3End + frameStart);
    }
    return buffer.subarray(id3End);
  }
  
  // No ID3 header, find first frame
  const frameStart = findFirstMp3Frame(buffer);
  if (frameStart > 0) {
    return buffer.subarray(frameStart);
  }
  
  return buffer;
}

/**
 * Concatenates multiple MP3 buffers properly by keeping the first file's header
 * and stripping headers from subsequent files.
 */
function concatenateMp3Buffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0);
  if (buffers.length === 1) return buffers[0];
  
  // Keep the first buffer as-is (with its ID3 header)
  const result: Buffer[] = [buffers[0]];
  
  // Strip headers from subsequent buffers
  for (let i = 1; i < buffers.length; i++) {
    const stripped = stripId3Header(buffers[i]);
    result.push(stripped);
  }
  
  return Buffer.concat(result);
}

/**
 * Re-encodes an MP3 buffer using ffmpeg to fix duration metadata.
 * This writes a proper Xing/VBR header so players can display the correct duration.
 */
async function fixMp3Duration(inputBuffer: Buffer, storyId: string): Promise<Buffer> {
  const tempDir = join(tmpdir(), 'taleify-audio');
  
  try {
    // Ensure temp directory exists
    await mkdir(tempDir, { recursive: true });
    
    const inputPath = join(tempDir, `${storyId}-input.mp3`);
    const outputPath = join(tempDir, `${storyId}-output.mp3`);
    
    // Write input buffer to temp file
    await writeFile(inputPath, inputBuffer);
    
    // Re-encode with ffmpeg to fix VBR header
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('libmp3lame')
        .audioBitrate('192k')  // Use CBR for reliable duration calculation
        .outputOptions('-write_xing', '1')  // Ensure Xing header is written
        .on('error', (err: Error) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .on('end', () => {
          resolve();
        })
        .save(outputPath);
    });
    
    // Read the fixed output
    const outputBuffer = await readFile(outputPath);
    
    // Clean up temp files
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
    
    return outputBuffer;
  } catch (error) {
    console.error('Error fixing MP3 duration:', error);
    // If ffmpeg fails, return the original buffer
    return inputBuffer;
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ready' });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const author = formData.get('author') as string | null;
    const coverUrl = formData.get('coverUrl') as string | null;
    const narratorVoiceInput = formData.get('narratorVoice') as string | null;
    const voiceStability = parseFloat(formData.get('voiceStability') as string) || 0.6;
    const voiceStyle = parseFloat(formData.get('voiceStyle') as string) || 0.15;
    const voiceClarity = formData.get('voiceClarity') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 });
    }

    if (!title || !author) {
      return NextResponse.json({ error: 'Title and author are required' }, { status: 400 });
    }

    const storyId = randomUUID();
    console.log(`[${storyId}] Starting audiobook generation for: ${title}`);

    // Resolve narrator voice
    let narratorVoiceId = DEFAULT_NARRATOR_VOICE_ID;
    let voiceWarning: string | undefined;

    if (narratorVoiceInput && narratorVoiceInput.trim()) {
      console.log(`[${storyId}] Resolving custom narrator voice: ${narratorVoiceInput}`);
      const result = await resolveVoiceInput(narratorVoiceInput);
      
      if (result.voiceId) {
        narratorVoiceId = result.voiceId;
        console.log(`[${storyId}] Using custom narrator voice ID: ${narratorVoiceId}`);
      } else {
        console.log(`[${storyId}] Voice resolution failed, using default narrator`);
        voiceWarning = result.warning;
      }
    }

    // Update VOICE_POOL with the custom narrator voice
    VOICE_POOL.narrator = narratorVoiceId;
    VOICE_POOL.neutral = narratorVoiceId;

    // Store custom voice settings for this request
    const customVoiceSettings = {
      stability: voiceStability,
      similarity_boost: 0.8,
      style: voiceStyle,
      use_speaker_boost: voiceClarity,
    };
    
    console.log(`[${storyId}] Voice settings: stability=${voiceStability}, style=${voiceStyle}, clarity=${voiceClarity}`);

    // Parse PDF using unpdf
    console.log(`[${storyId}] Parsing PDF...`);
    let pdfText: string;
    try {
      const buffer = await file.arrayBuffer();
      console.log(`[${storyId}] File buffer size: ${buffer.byteLength}`);
      
      // Use unpdf to extract text
      const { extractText } = await import('unpdf');
      const result = await extractText(new Uint8Array(buffer));
      
      // Handle different return formats from unpdf
      if (typeof result.text === 'string') {
        pdfText = result.text;
      } else if (Array.isArray(result.text)) {
        pdfText = result.text.join('\n');
      } else {
        pdfText = String(result.text || '');
      }
      
      console.log(`[${storyId}] Extracted ${pdfText.length} characters from ${result.totalPages} pages`);
      console.log(`[${storyId}] First 200 chars: ${pdfText.substring(0, 200)}`);
    } catch (pdfError) {
      console.error(`[${storyId}] PDF parsing error:`, pdfError);
      return NextResponse.json({ 
        error: 'Failed to parse PDF', 
        details: pdfError instanceof Error ? pdfError.message : 'Unknown PDF error' 
      }, { status: 400 });
    }
    
    if (!pdfText || pdfText.length === 0) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
    }

    // Detect chapters
    console.log(`[${storyId}] Detecting chapters...`);
    const chapters = await detectChapters(pdfText);
    console.log(`[${storyId}] Found ${chapters.length} chapters`);

    // Create story record
    const supabase = getSupabaseAdmin();
    await supabase.from('stories').insert({
      id: storyId,
      title,
      author,
      description: 'AI-generated audiobook with character voices',
      cover_url: coverUrl || null,
    });

    // Process chapters
    const generatedChapters: GeneratedChapter[] = [];

    for (const chapter of chapters) {
      console.log(`[${storyId}] Processing chapter ${chapter.number}: ${chapter.title}`);

      const segments = await analyzeAndSplitText(chapter);
      console.log(`[${storyId}] Chapter has ${segments.length} segments`);

      const audioBuffers: Buffer[] = [];
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const isNarrator = segment.speaker.toLowerCase() === 'narrator';
        console.log(`[${storyId}] Generating audio for segment ${i + 1}/${segments.length} (${segment.speaker})`);
        
        const audioBuffer = await generateAudio(segment.text, segment.voiceId, isNarrator, customVoiceSettings);
        audioBuffers.push(audioBuffer);
        
        if (i < segments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Properly concatenate MP3s by stripping headers from subsequent segments
      const concatenatedAudio = concatenateMp3Buffers(audioBuffers);
      console.log(`[${storyId}] Concatenated ${audioBuffers.length} segments into ${concatenatedAudio.length} bytes`);
      
      // Re-encode with ffmpeg to fix duration metadata (Xing header)
      console.log(`[${storyId}] Re-encoding to fix duration metadata...`);
      const chapterAudio = await fixMp3Duration(concatenatedAudio, `${storyId}-ch${chapter.number}`);
      console.log(`[${storyId}] Re-encoded audio size: ${chapterAudio.length} bytes`);

      const audioPath = `${storyId}/chapter_${String(chapter.number).padStart(2, '0')}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from('audiobooks')
        .upload(audioPath, chapterAudio, { contentType: 'audio/mpeg', upsert: true });

      if (uploadError) {
        console.error(`[${storyId}] Upload error:`, uploadError);
        throw new Error(`Failed to upload: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from('audiobooks').getPublicUrl(audioPath);
      const audioUrl = urlData.publicUrl;

      await supabase.from('chapters').insert({
        story_id: storyId,
        title: chapter.title,
        order_index: chapter.number,
        audio_url: audioUrl,
      });

      generatedChapters.push({
        number: chapter.number,
        title: chapter.title,
        audioUrl,
        characters: Array.from(new Set(segments.map(s => s.speaker))),
        segmentCount: segments.length,
      });
    }

    console.log(`[${storyId}] Audiobook generation complete!`);

    return NextResponse.json({
      success: true,
      storyId,
      title,
      author,
      totalChapters: generatedChapters.length,
      chapters: generatedChapters,
      ...(voiceWarning && { voiceWarning }),
    });
  } catch (error) {
    console.error('Error generating audiobook:', error);
    return NextResponse.json(
      { error: 'Failed to generate audiobook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function detectChapters(fullText: string): Promise<Chapter[]> {
  // Ensure fullText is a string
  const text = String(fullText || '');
  const MAX_CHARS = 50000;
  const textForGPT = text.substring(0, MAX_CHARS);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Find chapter boundaries. Return valid JSON with exact start markers.' },
      {
        role: 'user',
        content: `Analyze this text and identify all chapters. Find the EXACT position where each chapter starts.

Return JSON:
{"chapters": [{"number": 1, "title": "Chapter title", "startMarker": "exact text that starts the chapter (first 50 chars)"}]}

The startMarker must be the EXACT text from the document so I can find it.

Text:
${textForGPT}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content || '{}';
  let chaptersRaw: Array<{ number: number; title: string; startMarker: string }>;

  try {
    const parsed = JSON.parse(content);
    chaptersRaw = parsed.chapters || [];
    if (!Array.isArray(chaptersRaw)) chaptersRaw = [chaptersRaw];
  } catch {
    chaptersRaw = [{ number: 1, title: 'Chapter 1', startMarker: text.substring(0, 50) }];
  }

  const chapters: Chapter[] = [];
  for (let i = 0; i < chaptersRaw.length; i++) {
    const ch = chaptersRaw[i];
    const marker = ch.startMarker || '';
    let startPos = text.indexOf(marker);
    if (startPos === -1) startPos = 0;

    let endPos = text.length;
    if (i + 1 < chaptersRaw.length) {
      const nextMarker = chaptersRaw[i + 1].startMarker || '';
      const nextPos = text.indexOf(nextMarker);
      if (nextPos > startPos) endPos = nextPos;
    }

    chapters.push({
      number: ch.number || i + 1,
      title: ch.title || `Chapter ${i + 1}`,
      text: text.substring(startPos, endPos).trim(),
    });
  }

  return chapters;
}

async function analyzeAndSplitText(chapter: Chapter): Promise<TextSegment[]> {
  if (chapter.text.length < 500) {
    return [{ speaker: 'Narrator', text: chapter.text, voiceId: VOICE_POOL.narrator }];
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Analyze characters and split by speaker. Return valid JSON.' },
      {
        role: 'user',
        content: `Split this chapter into segments by speaker (Narrator for non-dialogue, character names for dialogue).

Return JSON:
{
  "segments": [
    {"speaker": "Narrator", "text": "Once upon a time..."},
    {"speaker": "Alice", "text": "Where am I?", "gender": "female", "age": "young"},
    {"speaker": "Grandfather", "text": "Let me tell you a story.", "gender": "male", "age": "elderly"}
  ]
}

Age options: "young", "mature", "elderly", "child"
Gender options: "male", "female"

Chapter ${chapter.number}: ${chapter.title}

${chapter.text.substring(0, 15000)}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(content);
    const segments = parsed.segments || [];
    
    return segments.map((s: { speaker: string; text: string; gender?: string; age?: string }) => {
      let voiceId = VOICE_POOL.narrator;
      
      if (s.speaker.toLowerCase() !== 'narrator') {
        const gender = s.gender || 'neutral';
        const age = s.age || 'mature';
        const key = `${age}_${gender}`;
        voiceId = VOICE_POOL[key] || VOICE_POOL.neutral;
      }
      
      return { speaker: s.speaker, text: s.text, voiceId };
    });
  } catch {
    return [{ speaker: 'Narrator', text: chapter.text, voiceId: VOICE_POOL.narrator }];
  }
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

// Default voice settings optimized for audiobook narration
const DEFAULT_NARRATOR_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.6,           // Slightly higher for consistent narration
  similarity_boost: 0.8,    // Better voice identity preservation
  style: 0.15,              // Subtle expressiveness for narration
  use_speaker_boost: true,  // Enhanced clarity
};

const DEFAULT_DIALOGUE_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,           // Allow more variation for character expression
  similarity_boost: 0.8,    // Keep voice identity
  style: 0.4,               // More emotional expression for dialogue
  use_speaker_boost: true,  // Enhanced clarity
};

async function generateAudio(
  text: string, 
  voiceId: string, 
  isNarrator: boolean = false,
  customSettings?: VoiceSettings
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  const MAX_CHARS = 4500;
  if (text.length > MAX_CHARS) {
    text = text.substring(0, MAX_CHARS);
  }

  // Use custom settings if provided for narrator, otherwise use defaults
  let voiceSettings: VoiceSettings;
  if (isNarrator && customSettings) {
    voiceSettings = customSettings;
  } else if (isNarrator) {
    voiceSettings = DEFAULT_NARRATOR_VOICE_SETTINGS;
  } else {
    voiceSettings = DEFAULT_DIALOGUE_VOICE_SETTINGS;
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs error: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
