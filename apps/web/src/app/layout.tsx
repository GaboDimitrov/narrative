import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Narrative - Every Story, Told in Your Voice',
  description: 'Clone your voice and read bedtime stories to your children, even when you\'re away. AI-powered voice cloning for the most important stories.',
  keywords: ['bedtime stories', 'voice cloning', 'audiobooks', 'parenting', 'AI voice', 'children stories'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
