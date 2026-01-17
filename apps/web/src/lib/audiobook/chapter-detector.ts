import OpenAI from 'openai';

export interface Chapter {
  number: number;
  title: string;
  text: string;
  startMarker: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function detectChapters(fullText: string): Promise<Chapter[]> {
  const MAX_CHARS = 50000;
  const textForGPT = fullText.substring(0, MAX_CHARS);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Find chapter boundaries. Return valid JSON with exact start markers.',
      },
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
    chaptersRaw = [{ number: 1, title: 'Chapter 1', startMarker: fullText.substring(0, 50) }];
  }

  // Extract full text for each chapter
  const chapters: Chapter[] = [];
  for (let i = 0; i < chaptersRaw.length; i++) {
    const ch = chaptersRaw[i];
    const marker = ch.startMarker || '';
    let startPos = fullText.indexOf(marker);
    if (startPos === -1) startPos = 0;

    let endPos = fullText.length;
    if (i + 1 < chaptersRaw.length) {
      const nextMarker = chaptersRaw[i + 1].startMarker || '';
      const nextPos = fullText.indexOf(nextMarker);
      if (nextPos > startPos) endPos = nextPos;
    }

    const chapterText = fullText.substring(startPos, endPos).trim();

    chapters.push({
      number: ch.number || i + 1,
      title: ch.title || `Chapter ${i + 1}`,
      text: chapterText,
      startMarker: marker,
    });
  }

  return chapters;
}
