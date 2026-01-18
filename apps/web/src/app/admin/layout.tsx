import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminCheck = await isAdmin();

  if (!adminCheck) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-400">
              Narrative Admin
            </a>
            <a
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Back to Site
            </a>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
