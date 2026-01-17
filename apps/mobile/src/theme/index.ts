// Narrator Theme - Purple/Violet Gradient Aesthetic
// Vibrant, modern dark theme with neon accents

export const colors = {
  // Backgrounds (dark with subtle purple tint)
  background: '#0f0f1a',
  backgroundCard: '#1a1a2e',
  backgroundElevated: '#252540',
  backgroundInput: '#2a2a45',
  
  // Text
  textPrimary: '#ffffff',
  textSecondary: '#b8b8d0',
  textMuted: '#6b6b8a',
  textInverse: '#0f0f1a',
  
  // Accent (Purple/Violet gradient)
  accent: '#8b5cf6',
  accentLight: '#a78bfa',
  accentDark: '#7c3aed',
  accentPink: '#ec4899',
  accentBlue: '#3b82f6',
  
  // Gradient colors
  gradientStart: '#8b5cf6',
  gradientMiddle: '#a855f7',
  gradientEnd: '#ec4899',
  
  // Semantic
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // UI Elements
  border: '#3a3a55',
  divider: '#2a2a45',
  overlay: 'rgba(15, 15, 26, 0.85)',
  
  // Special
  star: '#fbbf24',
  starEmpty: '#404055',
  
  // Tab bar
  tabBarBackground: '#1a1a2e',
  tabBarActiveBackground: '#ffffff',
  tabBarActive: '#0f0f1a',
  tabBarInactive: '#6b6b8a',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 50,
  full: 9999,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const gradients = {
  primary: ['#8b5cf6', '#a855f7', '#ec4899'],
  purple: ['#8b5cf6', '#7c3aed'],
  pink: ['#ec4899', '#db2777'],
  blue: ['#3b82f6', '#2563eb'],
  card: ['#1a1a2e', '#252540'],
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  gradients,
};
