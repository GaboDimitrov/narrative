# Taleify - Cinematic AI Audiobooks

A Storytel-like mobile app MVP for playing audiobook content, built with React Native (Expo), Next.js, and Supabase.

## Project Structure

This is a monorepo managed with Bun workspaces:

```
taleify/
├── apps/
│   ├── mobile/          # React Native (Expo) mobile app
│   └── web/             # Next.js landing page
├── packages/
│   ├── supabase/        # Typed Supabase client + shared types
│   └── config/          # Shared TypeScript configs
├── supabase/
│   ├── migrations/      # Database schema migrations
│   └── seed.sql         # Sample data with public domain audiobooks
```

## Prerequisites

- **pnpm** >= 9.0.0 (install with `npm install -g pnpm`)
- **Node.js** >= 18.0.0
- **Expo CLI** (installed via dependencies)
- **Supabase Account** ([supabase.com](https://supabase.com))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd taleify
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Run the migrations:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Execute the SQL
4. (Optional) Seed sample data:
   - Copy and paste the contents of `supabase/seed.sql`
   - Execute the SQL

### 3. Configure Environment Variables

#### For Mobile App (`apps/mobile/.env`)

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### For Web App (`apps/web/.env.local`)

Create `apps/web/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (for admin operations - keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI API Key (for GPT chapter/character detection)
OPENAI_API_KEY=sk-your-openai-key

# ElevenLabs API Key (for text-to-speech generation)
ELEVENLABS_API_KEY=sk_your-elevenlabs-key
```

## Running the Apps

### Mobile App

```bash
# From project root
pnpm dev:mobile

# Or from the mobile directory
cd apps/mobile
pnpm start
# or: pnpm ios / pnpm android
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

### Web Landing Page

```bash
# From project root
pnpm dev:web

# Or from the web directory
cd apps/web
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Features Implemented

### Mobile App

- ✅ **Authentication**: Email/password sign in and sign up via Supabase
- ✅ **Story Browsing**: Home screen with story list (title, author, cover)
- ✅ **Story Details**: Chapter list with play buttons
- ✅ **Audio Playback**: React Native Track Player integration
  - Play/pause controls
  - Seek bar with current time
  - Skip forward/backward 15 seconds
  - Background audio support
- ✅ **Progress Tracking**:
  - Saves playback position every 10 seconds
  - Saves on pause/stop
  - Resumes from last position
- ✅ **Library**:
  - Continue Listening (stories with progress)
  - Favorites (toggle favorite on story detail)
- ✅ **Settings**: User email display and logout

### Web Landing Page

- ✅ **Hero Section**: "Cinematic AI audiobooks with character voices"
- ✅ **Features Section**: Multi-character voices, soundtracks, etc.
- ✅ **Roadmap Section**: MVP, AI voices, visual enhancements
- ✅ **Waitlist Form**: Email capture to Supabase
- ✅ **Responsive Design**: Mobile-friendly with Tailwind CSS

### Backend (Supabase)

- ✅ **Database Schema**:
  - `stories`: Story metadata
  - `chapters`: Chapter info with audio URLs
  - `favorites`: User favorites
  - `playback_progress`: Per-user, per-chapter progress
  - `waitlist_emails`: Landing page waitlist
- ✅ **Row Level Security (RLS)**:
  - Public read for stories/chapters
  - Private user data for favorites/progress
  - Anonymous insert for waitlist
- ✅ **Seed Data**: 3 sample stories with LibriVox public domain audio

## Database Schema

### stories
- `id` (uuid, primary key)
- `title` (text)
- `author` (text)
- `description` (text, nullable)
- `cover_url` (text, nullable)
- `created_at` (timestamptz)

### chapters
- `id` (uuid, primary key)
- `story_id` (uuid, foreign key)
- `title` (text)
- `order_index` (integer)
- `audio_url` (text)
- `duration_ms` (integer, nullable)
- `created_at` (timestamptz)

### favorites
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `story_id` (uuid, foreign key)
- `created_at` (timestamptz)
- Unique constraint: `(user_id, story_id)`

### playback_progress
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `chapter_id` (uuid, foreign key)
- `position_ms` (integer)
- `updated_at` (timestamptz)
- Unique constraint: `(user_id, chapter_id)`

### waitlist_emails
- `id` (uuid, primary key)
- `email` (text, unique)
- `created_at` (timestamptz)

## Tech Stack

- **Mobile**: React Native, Expo SDK 50, React Navigation, react-native-track-player
- **Web**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Language**: TypeScript everywhere
- **Package Manager**: Bun with workspaces
- **State Management**: React hooks, Supabase real-time subscriptions

## Development Commands

```bash
# Install dependencies
pnpm install

# Run web dev server (from root)
pnpm dev:web

# Run mobile dev server (from root)
pnpm dev:mobile

# Type checking
pnpm typecheck           # Check all
pnpm typecheck:web       # Check web only
pnpm typecheck:mobile    # Check mobile only

# Build web for production
pnpm build:web

# Run from individual directories
cd apps/web && pnpm dev
cd apps/mobile && pnpm start
```

## Troubleshooting

### Mobile App Issues

1. **Audio not playing**:
   - Make sure you've run `bun install` in the project root
   - Clear Expo cache: `cd apps/mobile && bun start --clear`
   - Ensure audio URLs are accessible (LibriVox URLs work)

2. **Authentication issues**:
   - Verify environment variables are set correctly
   - Check Supabase project is active
   - Ensure RLS policies are applied

3. **Build errors**:
   - Try removing `node_modules` and `bun.lockb`, then `bun install`
   - Update Expo: `cd apps/mobile && bunx expo install --fix`

### Web App Issues

1. **Waitlist form not working**:
   - Check Supabase env vars in `.env.local`
   - Verify RLS policy allows anonymous inserts to `waitlist_emails`

2. **Build fails**:
   - Clear Next.js cache: `cd apps/web && rm -rf .next`
   - Rebuild: `bun run build`

## Admin Features

### PDF to Audiobook Generator

Access the admin upload page at `/admin/upload` to generate audiobooks from PDF files.

**Requirements:**
1. User must have `admin` role in `user_profiles` table
2. All environment variables must be configured (OpenAI, ElevenLabs, Supabase)
3. Supabase Storage bucket `audiobooks` must exist with public access

**How it works:**
1. Upload a PDF file with title and author
2. GPT-4o detects chapter boundaries
3. GPT-4o analyzes characters and splits text by speaker
4. ElevenLabs generates audio with different voices per character
5. Audio is uploaded to Supabase Storage
6. Story and chapter records are created in the database

**To make a user an admin:**
```sql
INSERT INTO user_profiles (id, role) 
VALUES ('user-uuid-here', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## Next Steps / Future Enhancements

- [x] AI voice generation for multi-character narration
- [ ] Dynamic background music and sound effects
- [ ] AI-generated scene illustrations
- [ ] Offline downloads
- [ ] Variable playback speed
- [ ] Sleep timer
- [ ] Social sharing
- [ ] Publisher creation tools

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact support.
