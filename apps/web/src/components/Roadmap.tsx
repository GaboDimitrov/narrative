export default function Roadmap() {
  const phases = [
    {
      phase: 'MVP - Now',
      title: 'Curated Stories & Playback',
      items: [
        'Hand-selected audiobook library',
        'Mobile app with seamless playback',
        'Progress tracking across devices',
        'Favorites and continue listening',
      ],
      status: 'current',
    },
    {
      phase: 'Phase 2',
      title: 'AI Voice Acting & Soundtrack',
      items: [
        'Multi-character AI voice generation',
        'Dynamic background music',
        'Sound effects and ambience',
        'Voice customization options',
      ],
      status: 'next',
    },
    {
      phase: 'Phase 3',
      title: 'Visual Enhancement',
      items: [
        'AI-generated scene illustrations',
        'Character portraits',
        'Interactive story maps',
        'Publisher creation tools',
      ],
      status: 'future',
    },
  ];

  return (
    <section id="roadmap" className="py-24 bg-dark-elevated relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-pink/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-dark-card border border-dark-border text-primary-400 text-sm font-medium mb-4">
            Roadmap
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Our Journey
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Building the future of audiobooks, one innovation at a time
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {phases.map((phase, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                  phase.status === 'current'
                    ? 'bg-gradient-to-b from-primary-900/40 to-dark-card border-primary-500 shadow-glow'
                    : 'bg-dark-card border-dark-border hover:border-primary-500/30'
                }`}
              >
                {phase.status === 'current' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-500 to-accent-pink text-white">
                    In Progress
                  </div>
                )}
                
                <div className="mb-6">
                  <div className={`text-sm font-semibold mb-2 ${
                    phase.status === 'current' ? 'text-primary-400' : 'text-gray-500'
                  }`}>
                    {phase.phase}
                  </div>
                  <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                </div>

                <ul className="space-y-3">
                  {phase.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span className={`mt-1 ${
                        phase.status === 'current' ? 'text-primary-400' : 'text-gray-600'
                      }`}>
                        ✓
                      </span>
                      <span className="text-gray-400">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
