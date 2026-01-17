# Taleify Setup Guide

## Quick Start (5 minutes)

### 1. Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install Dependencies
```bash
cd taleify
bun install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Wait for the project to initialize (~2 minutes)
4. Get your credentials:
   - Go to Project Settings > API
   - Copy the "Project URL" (e.g., `https://xxxxx.supabase.co`)
   - Copy the "anon public" key

5. Run the database migrations:
   - Go to SQL Editor in Supabase dashboard
   - Click "New Query"
   - Copy and paste the entire contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Click "Run"
   - You should see "Success. No rows returned"

6. (Optional) Seed sample data:
   - In SQL Editor, create another new query
   - Copy and paste the entire contents of `supabase/seed.sql`
   - Click "Run"
   - You should see "Success" with rows inserted

### 4. Configure Environment Variables

#### Mobile App
Create `apps/mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Web App
Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the Apps

#### Web Landing Page
```bash
bun dev:web
```
Visit http://localhost:3000

#### Mobile App
```bash
bun dev:mobile
```

Then:
- Press `i` for iOS Simulator (requires macOS + Xcode)
- Press `a` for Android Emulator (requires Android Studio)
- Scan QR code with Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Troubleshooting

### "Cannot find module @taleify/supabase"
```bash
# From project root
bun install
```

### Mobile app won't start
```bash
cd apps/mobile
rm -rf node_modules
cd ../..
bun install
cd apps/mobile
bun start --clear
```

### Supabase errors
1. Double-check your .env files have the correct URL and key
2. Make sure you ran the migrations SQL in Supabase dashboard
3. Check that RLS policies are enabled (they're in the migration file)

### Audio won't play
1. The LibriVox URLs in seed.sql should work
2. If not, you can replace them with any public MP3 URL
3. Test a URL in your browser first to make sure it's accessible

## Next Steps

1. **Create an account**: Sign up in the mobile app
2. **Browse stories**: Check out the seeded audiobooks
3. **Play audio**: Tap a chapter and enjoy!
4. **Favorite a story**: On story detail, tap "Add to Favorites"
5. **Check library**: Your favorites and continue listening appear in Library tab

## Development Tips

- **Hot reload**: Both apps support hot reload - save a file and see changes instantly
- **Debugging**: 
  - Mobile: Shake device or press `j` in terminal for debug menu
  - Web: Use browser DevTools
- **Database**: Use Supabase Table Editor to view/edit data
- **Logs**: Mobile logs appear in terminal where you ran `bun dev:mobile`

## Project Structure

```
taleify/
├── apps/
│   ├── mobile/              # Expo app
│   │   ├── src/
│   │   │   ├── screens/     # All screens
│   │   │   ├── navigation/  # Navigation setup
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── lib/         # Supabase client
│   │   │   └── services/    # Background services
│   │   └── App.tsx          # Entry point
│   └── web/                 # Next.js app
│       └── src/
│           ├── app/         # App router pages
│           └── components/  # React components
└── packages/
    └── supabase/            # Shared Supabase types
```

## Common Tasks

### Add a new story
Use Supabase Table Editor or SQL:
```sql
INSERT INTO stories (title, author, description, cover_url) 
VALUES ('Story Title', 'Author Name', 'Description...', 'https://...');
```

### Add chapters to a story
```sql
INSERT INTO chapters (story_id, title, order_index, audio_url, duration_ms) 
VALUES ('story-uuid', 'Chapter 1', 1, 'https://...mp3', 600000);
```

### View waitlist signups
Go to Supabase > Table Editor > waitlist_emails

### Reset database
Run the migration SQL again (it uses `CREATE TABLE IF NOT EXISTS` so it's safe)

## Need Help?

- Check the main [README.md](README.md)
- Review Supabase docs: https://supabase.com/docs
- Expo docs: https://docs.expo.dev
- Next.js docs: https://nextjs.org/docs
