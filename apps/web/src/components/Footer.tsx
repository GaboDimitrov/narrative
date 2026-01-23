import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-deep-violet border-t border-fairy">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sparkle-gold to-warm-glow flex items-center justify-center">
                <svg className="w-6 h-6 text-midnight" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-moon-white to-fairy-gold bg-clip-text text-transparent">
                Narrative
              </span>
            </Link>
            <p className="text-secondary leading-relaxed">
              Every story, told in your voice. Bedtime stories that keep families connected.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-moon-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-secondary hover:text-fairy-gold transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-secondary hover:text-fairy-gold transition-colors duration-200">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#roadmap" className="text-secondary hover:text-fairy-gold transition-colors duration-200">
                  Roadmap
                </a>
              </li>
              <li>
                <span className="text-muted">Mobile App (Coming Soon)</span>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-moon-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-muted">About</span>
              </li>
              <li>
                <span className="text-muted">Blog</span>
              </li>
              <li>
                <span className="text-muted">Careers</span>
              </li>
            </ul>
          </div>
          
          {/* Connect */}
          <div>
            <h4 className="font-display font-semibold text-moon-white mb-4">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-secondary hover:text-fairy-gold transition-colors duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-fairy-gold transition-colors duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Discord
                </a>
              </li>
              <li>
                <a href="mailto:hello@narrative.ai" className="text-secondary hover:text-fairy-gold transition-colors duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-fairy flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm">
            &copy; {new Date().getFullYear()} Narrative. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted hover:text-secondary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted hover:text-secondary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
