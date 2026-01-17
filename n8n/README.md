# n8n Workflows for Taleify

## Novel to Audiobook Generator

This workflow converts PDF novels into multi-voice audiobooks using AI. Works on n8n Cloud.

### Workflow Overview

```
Form Trigger → Extract PDF → Chunk Text → GPT: Detect Chapters → Parse JSON
    ↓
Loop Chapters → GPT: Analyze Characters → Parse & Assign Voices → Split Segments
    ↓
ElevenLabs TTS → Rate Limit Wait → Aggregate Audio → CloudConvert Merge → Upload Supabase
    ↓
Create Story Record → Create Chapter Records → Success Response
    ↓
Error Trigger → Handle Error → Error Response (parallel error handling)
```

### Features

- **Smart Text Chunking**: Splits large novels into manageable chunks to avoid GPT token limits
- **Dynamic Voice Assignment**: Detects character genders and assigns different voices
- **Chapter Detection**: Uses GPT-4o to intelligently detect chapter boundaries
- **Multi-Voice Audio**: Generates different voices for narrator vs. characters (male/female)
- **Rate Limiting**: Built-in delays to prevent hitting ElevenLabs API limits
- **Error Handling**: Catches and reports errors with detailed information
- **MP3 Output**: Merges audio segments into one MP3 file per chapter
- **Cloud-Compatible**: Uses CloudConvert API for audio merging (works on n8n Cloud)
- **Database Integration**: Creates story and chapter records in Supabase

### Setup Instructions

#### 1. Get API Keys

You'll need API keys from:

| Service | URL | Free Tier |
|---------|-----|-----------|
| OpenAI | https://platform.openai.com/api-keys | Pay-as-you-go |
| ElevenLabs | https://elevenlabs.io/app/settings/api-keys | 10k chars/month |
| CloudConvert | https://cloudconvert.com/dashboard/api/v2/keys | 25 conversions/day |
| Supabase | Your project → Settings → API | Free tier available |

#### 2. Configure Credentials in n8n

Go to n8n → Settings → Credentials and add:

**a) OpenAI API**
- Click "Add Credential" → "OpenAI API"
- Enter your OpenAI API key
- Save

**b) ElevenLabs API**
- Click "Add Credential" → "ElevenLabs API"  
- Enter your ElevenLabs API key
- Save

**c) CloudConvert API**
- Click "Add Credential" → "CloudConvert API"
- Enter your CloudConvert API key
- Save

**d) Supabase API**
- Click "Add Credential" → "Supabase API"
- Enter your Supabase URL (e.g., `https://xxxxx.supabase.co`)
- Enter your service_role key (from Supabase Settings → API)
- Save

#### 3. Create Supabase Storage Bucket

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the audiobooks bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audiobooks', 'audiobooks', true);

-- Allow public read access
CREATE POLICY "Public audiobook access"
ON storage.objects FOR SELECT
USING (bucket_id = 'audiobooks');

-- Allow service role uploads
CREATE POLICY "Service role can upload audiobooks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audiobooks');
```

#### 4. Import Workflow

- Go to your n8n instance
- Click "+" → Import from File
- Select `workflows/novel-to-audiobook.json`
- **Assign credentials** to the nodes (click each node and select the credential)
- Activate the workflow

### Usage

1. After activating the workflow, click on the "Form Trigger" node
2. Copy the "Production URL" (looks like: `https://your-instance.app.n8n.cloud/form/xxxxx`)
3. Open that URL in your browser
4. Fill out the form:
   - **PDF File**: Upload your novel PDF
   - **Title**: Book title
   - **Author**: Author name
   - **Cover Image URL**: (Optional) URL to cover image
   - **Supabase URL**: Your Supabase project URL
5. Submit and wait for processing

The workflow will:
1. Extract text from the PDF
2. Split text into chunks for processing
3. Use GPT-4o to detect chapter boundaries
4. For each chapter:
   - Analyze characters and dialogue
   - Assign unique voices based on gender
   - Generate audio for each segment via ElevenLabs
   - Merge segments into one MP3 file per chapter via CloudConvert
5. Upload all audio to Supabase Storage
6. Create story and chapter records in the database

### Voice Mapping

The workflow automatically assigns voices based on character detection:

| Character Type | Voice ID | Description |
|---------------|----------|-------------|
| Narrator | 21m00Tcm4TlvDq8ikWAM | Rachel - clear narrator |
| Male 1 | VR6AewLTigWG4xSOukaG | Arnold - deep male |
| Male 2 | ErXwobaYiN019PkySvjV | Antoni - young male |
| Male 3 | pNInz6obpgDQGcFmaJgB | Adam - middle-aged |
| Female 1 | jsCqWAovK2LkecY7zXl4 | Bella - young female |
| Female 2 | EXAVITQu4vr4xnSDxMaL | Sarah - mature female |
| Female 3 | XB0fDUnXU5powFXDhCwa | Charlotte - British |

### Testing the Workflow

#### Quick Test (Recommended First)

1. Create a simple test PDF with 1-2 pages of text
2. Upload via the form with:
   - Title: "Test Book"
   - Author: "Test Author"
   - Your Supabase URL
3. Monitor the workflow execution in n8n
4. Check Supabase Storage for the output MP3

#### Test Each Section

You can test individual nodes by:
1. Opening the workflow in the editor
2. Clicking "Test workflow" (runs from trigger)
3. Or clicking "Test step" on individual nodes

#### Verify Output

After successful run, check:
- **Supabase Storage**: `audiobooks/{storyId}/chapter_01.mp3`
- **Supabase Database**: 
  - `stories` table has new record
  - `chapters` table has chapter with `audio_url`

### Output Format

Each chapter is saved as:
- **Format**: MP3 (audio/mpeg)
- **Bitrate**: Original ElevenLabs quality
- **Filename**: `chapter_01.mp3`, `chapter_02.mp3`, etc.
- **Location**: `{supabase_url}/storage/v1/object/public/audiobooks/{story_id}/chapter_XX.mp3`

### Mobile App Integration

The chapter records include all data needed for the mobile app:

```json
{
  "id": "uuid",
  "story_id": "uuid",
  "title": "Chapter 1: The Beginning",
  "order_index": 1,
  "audio_url": "https://xxx.supabase.co/storage/v1/object/public/audiobooks/xxx/chapter_01.mp3",
  "duration_ms": null
}
```

The mobile app can:
- Fetch all chapters for a story (ordered by `order_index`)
- Display chapter list
- Play each chapter's `audio_url`
- Track playback progress

### Limitations

1. **CloudConvert Free Tier**: 25 conversions/day. Each chapter = 1 conversion.

2. **Long Novels**: Very long novels may timeout. Consider:
   - Increasing n8n execution timeout
   - Processing fewer chapters per run

3. **ElevenLabs Limits**: Free tier has character limits. The workflow includes a 1-second delay between requests.

### Troubleshooting

**"Extract from PDF fails - binary data not found"**
- The workflow now preserves binary data (fix applied)
- The binary property is `PDF_File` (with underscore)
- Make sure you're uploading a valid PDF file

**"OpenAI/ElevenLabs/CloudConvert nodes fail with credential errors"**
- Go to the workflow editor
- Click on each API node
- In the Credentials section, select your saved credentials

**"CloudConvert merge fails"**
- Check your CloudConvert API key is valid
- Verify you haven't exceeded daily conversion limits
- Check the job status in CloudConvert dashboard

**"Supabase upload fails with 404"**
- Ensure the `audiobooks` storage bucket exists in Supabase
- Check that your service_role key has storage permissions
- Verify your Supabase URL is correct

### Cost Estimates per Novel

| Service | Estimated Cost |
|---------|---------------|
| OpenAI GPT-4o | $0.50 - $2.00 |
| ElevenLabs | $5 - $15 |
| CloudConvert | Free (25/day) or $0.02/conversion |
| **Total** | **$6 - $17** |

Costs vary based on novel length and number of characters.

### Recent Changes (v2)

- **FIXED**: Binary data preservation in "Set Novel Inputs" node
- **FIXED**: Binary property name (`PDF_File` instead of `PDF File`)
- **CHANGED**: Replaced FFmpeg with CloudConvert for n8n Cloud compatibility
- **CHANGED**: Output format from M4B to MP3
- **ADDED**: Proper chapter record creation with audio URLs
