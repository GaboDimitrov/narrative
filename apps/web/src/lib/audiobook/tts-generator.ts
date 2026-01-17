import { VoicedSegment } from './voice-mapper';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Voice settings optimized for audiobook narration
const NARRATOR_VOICE_SETTINGS = {
  stability: 0.6,           // Slightly higher for consistent narration
  similarity_boost: 0.8,    // Better voice identity preservation
  style: 0.15,              // Subtle expressiveness for narration
  use_speaker_boost: true,  // Enhanced clarity
};

const DIALOGUE_VOICE_SETTINGS = {
  stability: 0.5,           // Allow more variation for character expression
  similarity_boost: 0.8,    // Keep voice identity
  style: 0.4,               // More emotional expression for dialogue
  use_speaker_boost: true,  // Enhanced clarity
};

export interface AudioSegment {
  index: number;
  speaker: string;
  audioBuffer: Buffer;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateAudio(
  segment: VoicedSegment,
  index: number
): Promise<AudioSegment> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  // Use different voice settings for narrator vs dialogue
  const isNarrator = segment.speaker.toLowerCase() === 'narrator';
  const voiceSettings = isNarrator ? NARRATOR_VOICE_SETTINGS : DIALOGUE_VOICE_SETTINGS;

  const response = await fetch(`${ELEVENLABS_API_URL}/${segment.voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: segment.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  
  return {
    index,
    speaker: segment.speaker,
    audioBuffer: Buffer.from(arrayBuffer),
  };
}

export async function generateChapterAudio(
  segments: VoicedSegment[]
): Promise<Buffer[]> {
  const audioBuffers: Buffer[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    try {
      const audio = await generateAudio(segment, i);
      audioBuffers.push(audio.audioBuffer);
      
      // Rate limiting - wait 1 second between requests
      if (i < segments.length - 1) {
        await sleep(1000);
      }
    } catch (error) {
      console.error(`Error generating audio for segment ${i}:`, error);
      throw error;
    }
  }

  return audioBuffers;
}

// Concatenate multiple MP3 buffers
// Note: This is a simple concatenation that works for MP3s
// For production, consider using a proper audio library
export function concatenateAudioBuffers(buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers);
}
