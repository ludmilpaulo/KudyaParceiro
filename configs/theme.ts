export const theme = {
  colors: {
    primary: '#0171CE',
    primaryDark: '#015AAB',
    accent: '#FCB61A',
    accentDark: '#E5A017',
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
    hero: ['#0171CE', '#0359A8', '#023E75'] as const,
    warm: ['#FCB61A', '#0171CE'] as const,
    button: ['#0171CE', '#0359A8'] as const,
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
