export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-dark-bg min-h-screen flex items-center pt-20">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60" />
      
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-card border border-dark-border mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-sm text-primary-300">Now in Early Access</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-primary-400">
            Cinematic AI Audiobooks
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience stories like never before with multi-character AI voices, 
            immersive soundtracks, and cinematic production quality.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="#waitlist"
              className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              Join Waitlist
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg bg-dark-card border border-dark-border text-gray-300 hover:border-primary-500 hover:text-white transition-all duration-300"
            >
              Learn More
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-dark-card/50 border border-dark-border/50 backdrop-blur-sm">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-300">10+</div>
              <div className="text-sm text-gray-500 mt-2">Voice Characters</div>
            </div>
            <div className="p-6 rounded-2xl bg-dark-card/50 border border-dark-border/50 backdrop-blur-sm">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-pink">1000s</div>
              <div className="text-sm text-gray-500 mt-2">Stories Coming</div>
            </div>
            <div className="p-6 rounded-2xl bg-dark-card/50 border border-dark-border/50 backdrop-blur-sm">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-pink to-primary-400">4K</div>
              <div className="text-sm text-gray-500 mt-2">Audio Quality</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-bg to-transparent" />
    </section>
  );
}
