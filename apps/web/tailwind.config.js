/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      colors: {
        // Base / Night (UI foundation)
        abyss: '#0A0713',           // Deepest shadows, edges, bottom gradients
        midnight: '#120F22',         // Main background behind most elements
        'deep-violet': '#1D182F',    // Secondary background, cards
        'night-blue': '#2E2846',     // Raised surfaces, overlays, active panels

        // Neutrals / Mist (calm layering)
        'fog-purple': '#553F4C',     // Secondary panels, disabled states
        'mauve-muted': '#725C69',    // Subtle dividers, muted text
        'dust-shadow': '#3D282E',    // Muted backgrounds

        // Gold / Magic (signature accents)
        'fairy-gold': '#E2CA9D',     // CTAs, highlights, active icons
        'warm-glow': '#DCAD73',      // Hover states, pressed
        'sparkle-gold': '#EFC887',   // Primary CTA background, glow

        // Warm accents (supporting)
        'amber-copper': '#C78F5E',   // Secondary buttons, attention states
        'candle-brown': '#B37355',   // Chip backgrounds
        'wood-warmth': '#8F5F42',    // Tertiary accents

        // Special accent
        'enchanted-blue': '#586C9D', // Links, active states, toggles

        // Text
        'moon-white': '#FCFBF8',     // Headings, hero text, key labels
      },
      backgroundColor: {
        'overlay': 'rgba(46, 40, 70, 0.75)',
        'card': '#1D182F',
        'raised': '#2E2846',
      },
      textColor: {
        'primary': '#FCFBF8',
        'secondary': 'rgba(252, 251, 248, 0.72)',
        'muted': 'rgba(226, 202, 157, 0.55)',
      },
      borderColor: {
        'fairy': 'rgba(226, 202, 157, 0.12)',
        'fairy-medium': 'rgba(226, 202, 157, 0.25)',
        'fairy-strong': 'rgba(226, 202, 157, 0.45)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-night': 'linear-gradient(135deg, #0A0713 0%, #120F22 45%, #2E2846 100%)',
        'gradient-night-vertical': 'linear-gradient(180deg, #0A0713 0%, #120F22 50%, #2E2846 100%)',
        'gradient-gold': 'linear-gradient(135deg, #EFC887 0%, #DCAD73 100%)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(239, 200, 135, 0.35) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-gold': '0 0 24px rgba(239, 200, 135, 0.35)',
        'glow-gold-lg': '0 0 40px rgba(239, 200, 135, 0.45)',
        'glow-gold-xl': '0 0 60px rgba(239, 200, 135, 0.5)',
        'glow-blue': '0 0 20px rgba(88, 108, 157, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'sparkle': 'sparkle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
