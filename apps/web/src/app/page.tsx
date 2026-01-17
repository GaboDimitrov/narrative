import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ScrollShowcase from '@/components/ScrollShowcase';
import Features from '@/components/Features';
import Roadmap from '@/components/Roadmap';
import WaitlistForm from '@/components/WaitlistForm';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-bg">
      <Header />
      <Hero />
      <ScrollShowcase />
      <Features />
      <Roadmap />
      
      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 bg-dark-bg relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-pink/15 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Card container */}
            <div className="p-12 rounded-3xl bg-gradient-to-br from-dark-card to-dark-elevated border border-dark-border relative overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-pink/5" />
              
              <div className="relative z-10 text-center">
                <span className="inline-block px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                  Early Access
                </span>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Join the Waitlist
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
                  Be the first to experience the future of audiobooks. Get early access and exclusive updates.
                </p>
                
                <WaitlistForm />
                
                <p className="mt-8 text-sm text-gray-500">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
