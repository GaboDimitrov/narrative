import { Character, TextSegment } from './character-analyzer';

// ElevenLabs voice IDs - selected for maximum distinctiveness (accents, tones, ages)
const VOICE_POOL = {
  // Narrator: Daniel - British male, deep authoritative news presenter style
  narrator: 'onwK4e9ZLuTAKqWW03F9',
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
  neutral: 'onwK4e9ZLuTAKqWW03F9',
} as const;

export interface VoicedSegment extends TextSegment {
  voiceId: string;
}

export function assignVoices(
  characters: Character[],
  segments: TextSegment[]
): VoicedSegment[] {
  // Map each character to a voice
  const characterVoices: Record<string, string> = {};

  for (const char of characters) {
    const name = char.name;
    
    if (char.voiceType === 'narrator' || name.toLowerCase() === 'narrator') {
      characterVoices[name] = VOICE_POOL.narrator;
    } else {
      const gender = char.gender || 'neutral';
      const age = char.ageRange || 'mature';
      
      if (age === 'child') {
        characterVoices[name] = VOICE_POOL.child;
      } else {
        const key = `${age}_${gender}` as keyof typeof VOICE_POOL;
        characterVoices[name] = VOICE_POOL[key] || VOICE_POOL.narrator;
      }
    }
  }

  // Assign voice IDs to segments
  return segments.map((seg) => ({
    ...seg,
    voiceId: characterVoices[seg.speaker] || VOICE_POOL.narrator,
  }));
}

// Split long segments into chunks under the ElevenLabs limit
const MAX_CHARS = 4500;

export function chunkSegments(segments: VoicedSegment[]): VoicedSegment[] {
  const chunkedSegments: VoicedSegment[] = [];

  for (const seg of segments) {
    const text = seg.text || '';
    
    if (text.length <= MAX_CHARS) {
      chunkedSegments.push(seg);
    } else {
      // Split by sentences, then chunk
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let chunk = '';
      
      for (const sentence of sentences) {
        if ((chunk + sentence).length > MAX_CHARS && chunk.length > 0) {
          chunkedSegments.push({ ...seg, text: chunk.trim() });
          chunk = sentence;
        } else {
          chunk += sentence;
        }
      }
      
      if (chunk.trim()) {
        chunkedSegments.push({ ...seg, text: chunk.trim() });
      }
    }
  }

  return chunkedSegments;
}
