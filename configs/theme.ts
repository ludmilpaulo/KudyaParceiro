export const theme = {
  colors: {
    primary: '#6D28D9',
    primaryDark: '#5B21B6',
    accent: '#7C3AED',
    accentDark: '#5B21B6',
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    surface: '#FFFFFF',
    background: '#F8FAFC',
    border: '#E5E7EB',
    error: '#DC2626',
    success: '#059669',
  },
  gradient: {
    hero: ['#6D28D9', '#5B21B6', '#4C1D95'] as const,
    warm: ['#7C3AED', '#6D28D9'] as const,
    button: ['#6D28D9', '#5B21B6'] as const,
    card: ['#FFFFFF', '#F8FAFC'] as const,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

export type Theme = typeof theme;
