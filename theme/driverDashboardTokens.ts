export const driverDashboardColors = {
  primary: "#0066D6",
  primaryDark: "#004FB8",
  primaryMid: "#0077E6",
  primaryLight: "#EAF3FF",

  background: "#F5F8FC",
  card: "#FFFFFF",

  textPrimary: "#071B3A",
  textSecondary: "#5F6B7A",
  textMuted: "#8A94A6",

  success: "#12A85A",
  successLight: "#EAF9F0",

  warning: "#F5A623",
  warningLight: "#FFF4DF",

  danger: "#E53935",
  dangerLight: "#FFECEC",

  purple: "#7B2FF7",
  purpleLight: "#F1E8FF",

  border: "#E5EAF2",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

export const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 5,
} as const;

export const headerGradient = ["#0077E6", "#0066D6", "#004FB8"] as const;
