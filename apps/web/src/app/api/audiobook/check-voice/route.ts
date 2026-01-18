import { NextRequest, NextResponse } from 'next/server';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
}

/**
 * Checks if a string looks like an ElevenLabs voice ID (alphanumeric, ~20 chars).
 */
function looksLikeVoiceId(input: string): boolean {
  return /^[a-zA-Z0-9]{15,25}$/.test(input.trim());
}

/**
 * Validates a voice ID and returns voice details.
 */
async function getVoiceById(voiceId: string, apiKey: string): Promise<ElevenLabsVoice | null> {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      voice_id: data.voice_id,
      name: data.name,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches all voices and finds one by name.
 */
async function findVoiceByName(voiceName: string, apiKey: string): Promise<{ voice: ElevenLabsVoice | null; availableVoices: string[] }> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      return { voice: null, availableVoices: [] };
    }

    const data = await response.json();
    const voices: ElevenLabsVoice[] = data.voices || [];
    
    // Find voice by name (case-insensitive)
    const normalizedName = voiceName.toLowerCase().trim();
    const matchedVoice = voices.find(
      (v) => v.name.toLowerCase() === normalizedName
    );

    return {
      voice: matchedVoice || null,
      availableVoices: voices.map((v) => v.name),
    };
  } catch {
    return { voice: null, availableVoices: [] };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const voiceInput = body.voice as string;

    if (!voiceInput || !voiceInput.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a voice name or ID.',
      });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'ElevenLabs API key is not configured on the server.',
      });
    }

    const trimmedInput = voiceInput.trim();

    // Check if it looks like a voice ID
    if (looksLikeVoiceId(trimmedInput)) {
      const voice = await getVoiceById(trimmedInput, apiKey);
      
      if (voice) {
        return NextResponse.json({
          success: true,
          message: `Voice found! "${voice.name}" is available.`,
          voiceId: voice.voice_id,
          voiceName: voice.name,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `Voice ID "${trimmedInput}" was not found or is not accessible with your API key.`,
        });
      }
    }

    // Otherwise, search by name
    const { voice, availableVoices } = await findVoiceByName(trimmedInput, apiKey);

    if (voice) {
      return NextResponse.json({
        success: true,
        message: `Voice found! "${voice.name}" is available.`,
        voiceId: voice.voice_id,
        voiceName: voice.name,
      });
    }

    // Voice not found - return suggestions
    const suggestions = availableVoices.slice(0, 15).join(', ');
    return NextResponse.json({
      success: false,
      message: `Voice "${trimmedInput}" was not found. Available voices: ${suggestions}${availableVoices.length > 15 ? '...' : ''}`,
    });

  } catch (error) {
    console.error('Error checking voice:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while checking the voice.',
    });
  }
}
