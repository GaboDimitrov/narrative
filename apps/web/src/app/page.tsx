import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Roadmap from '@/components/Roadmap';
import WaitlistForm from '@/components/WaitlistForm';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-midnight">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <Roadmap />
      
      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 bg-midnight relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sparkle-gold/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-copper/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Card container */}
            <div className="p-12 rounded-3xl bg-gradient-to-br from-deep-violet to-night-blue/50 border border-fairy relative overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-sparkle-gold/5 to-transparent" />
              
              <div className="relative z-10 text-center">
                <span className="badge-magic mb-6 inline-block">
                  Early Access
                </span>
                
                <h2 className="font-display text-4xl md:text-5xl font-bold text-moon-white mb-4">
                  Join the Waitlist
                </h2>
                <p className="text-xl text-secondary mb-10 max-w-xl mx-auto">
                  Be the first to tell bedtime stories in your own voice. Get early access and exclusive updates.
                </p>
                
                <WaitlistForm />
                
                <p className="mt-8 text-sm text-muted">
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
