import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { UserMenu } from '@/components/UserMenu';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { PlayerBar } from '@/components/PlayerBar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <PlayerProvider userId={user.id}>
      <div className="min-h-screen bg-dark-bg pb-24">
        {/* App Header */}
        <header className="sticky top-0 z-50 bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/library" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-pink flex items-center justify-center">
                  <span className="text-white text-lg">📖</span>
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-300">
                  Narrative
                </span>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-1">
                <Link
                  href="/library"
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-card transition-all"
                >
                  Library
                </Link>
                <Link
                  href="/history"
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-card transition-all"
                >
                  History
                </Link>
              </nav>

              {/* User Menu */}
              <UserMenu email={user.email || ''} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-pink/5 rounded-full blur-3xl" />
        </div>

        {/* Persistent Player Bar */}
        <PlayerBar />
      </div>
    </PlayerProvider>
  );
}
