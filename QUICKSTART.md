# Narrative - Quick Start (2 minutes)

## Prerequisites
- Install Bun: `curl -fsSL https://bun.sh/install | bash`
- Create Supabase account: https://supabase.com

## Setup Steps

### 1. Install & Configure
```bash
# Install dependencies
bun install

# Create mobile env file
cat > apps/mobile/.env << EOF
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

# Create web env file
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF
```

### 2. Set Up Supabase Database

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/migrations/20240101000000_initial_schema.sql`
3. Paste and run
4. Copy contents of `supabase/seed.sql`
5. Paste and run

### 3. Run the Apps

**Web (from project root):**
```bash
bun dev:web
# Visit http://localhost:3000
```

**Mobile (from project root):**
```bash
bun dev:mobile
# Scan QR code with Expo Go app
```

## Done!
- Sign up in the mobile app
- Browse the 3 seeded audiobooks
- Play a chapter and enjoy!

For detailed setup, see [SETUP.md](SETUP.md)
