export * from './colors';
export * from './typography';

export const radii = {
  pill: 999,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  hero: 32,
} as const;

export const shadows = {
  floating: {
    shadowColor: '#14124D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;
