export const colors = {
  // Brand
  primary: '#006948',
  primaryDark: '#004d35',
  primaryLight: '#E8F5EE',
  primaryText: '#004D34',

  navy: '#273D80',
  navyDark: '#1B2B5B',
  navyLight: '#EEF2FF',

  // Status colors
  success: '#059669',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // Neutrals (Light)
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardSecondary: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Dark mode
  dark: {
    background: '#0B1120',
    card: '#1E293B',
    cardSecondary: '#334155',
    border: '#334155',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  micro: {
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
};

export const layout = {
  minTouchTarget: 44,
  borderRadius: 12,
  borderRadiusSm: 8,
  borderRadiusLg: 16,
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};
