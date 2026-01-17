export default function Features() {
  const features = [
    {
      title: 'Multi-Character Voices',
      description: 'Each character speaks with their own unique AI-generated voice, bringing stories to life like never before.',
      icon: '🎭',
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      title: 'Cinematic Soundtracks',
      description: 'Immersive background music and sound effects that adapt to the story\'s mood and pacing.',
      icon: '🎵',
      gradient: 'from-accent-pink to-primary-500',
    },
    {
      title: 'Premium Player',
      description: 'Seamless playback experience with offline downloads, variable speed, and smart bookmarking.',
      icon: '📱',
      gradient: 'from-primary-600 to-accent-blue',
    },
    {
      title: 'Fast Production',
      description: 'Publishers can create professional audiobooks in hours instead of weeks using our AI platform.',
      icon: '⚡',
      gradient: 'from-accent-pink to-primary-400',
    },
    {
      title: 'Scene Visualization',
      description: 'Coming soon: AI-generated images for key scenes to enhance your listening experience.',
      icon: '🎨',
      gradient: 'from-primary-400 to-accent-pink',
    },
    {
      title: 'Smart Discovery',
      description: 'Find your next favorite story with AI-powered recommendations based on your taste.',
      icon: '🔍',
      gradient: 'from-accent-blue to-primary-500',
    },
  ];

  return (
    <section id="features" className="py-24 bg-dark-bg relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-dark-card border border-dark-border text-primary-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            The Future of Audiobooks
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Combining cutting-edge AI with storytelling craft to create experiences 
            that blur the line between audiobook and audio drama.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-accent-pink/5 transition-all duration-300" />
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 text-3xl`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-primary-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
