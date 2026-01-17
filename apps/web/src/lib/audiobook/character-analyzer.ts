import OpenAI from 'openai';

export interface Character {
  name: string;
  gender: 'male' | 'female' | 'neutral';
  ageRange: 'child' | 'young' | 'mature' | 'elderly';
  voiceType: 'narrator' | 'protagonist' | 'antagonist' | 'supporting';
}

export interface TextSegment {
  speaker: string;
  text: string;
  voiceId?: string;
}

export interface CharacterAnalysis {
  characters: Character[];
  segments: TextSegment[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeCharacters(
  chapterNumber: number,
  chapterTitle: string,
  chapterText: string
): Promise<CharacterAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Analyze characters and split by speaker. Return valid JSON.',
      },
      {
        role: 'user',
        content: `Analyze this chapter and identify all speaking characters. Split the text into segments by speaker.

For each character provide: name, gender (male/female/neutral), age_range (child/young/mature/elderly), voice_type (narrator/protagonist/antagonist/supporting)

Return JSON:
{
  "characters": [
    {"name": "Narrator", "gender": "neutral", "age_range": "mature", "voice_type": "narrator"},
    {"name": "Alice", "gender": "female", "age_range": "young", "voice_type": "protagonist"}
  ],
  "segments": [
    {"speaker": "Narrator", "text": "Once upon a time..."},
    {"speaker": "Alice", "text": "Where am I?"}
  ]
}

Chapter ${chapterNumber}: ${chapterTitle}

${chapterText}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '{}';
  
  try {
    const parsed = JSON.parse(content);
    const characters: Character[] = (parsed.characters || []).map((c: Record<string, string>) => ({
      name: c.name,
      gender: c.gender || 'neutral',
      ageRange: c.age_range || 'mature',
      voiceType: c.voice_type || 'supporting',
    }));
    
    const segments: TextSegment[] = (parsed.segments || []).map((s: Record<string, string>) => ({
      speaker: s.speaker,
      text: s.text,
    }));

    return { characters, segments };
  } catch {
    return {
      characters: [{ name: 'Narrator', gender: 'neutral', ageRange: 'mature', voiceType: 'narrator' }],
      segments: [{ speaker: 'Narrator', text: chapterText }],
    };
  }
}
