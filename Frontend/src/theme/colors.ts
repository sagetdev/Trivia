export const colors = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#ECEEF5',
  border: '#E2E5EF',

  text: '#10121C',
  textMuted: '#61687D',
  textFaint: '#9AA1B5',

  primary: '#5B4DF5',
  primarySoft: '#ECEAFE',
  onPrimary: '#FFFFFF',

  success: '#16A367',
  successSoft: '#E3F6ED',
  error: '#E5484D',
  errorSoft: '#FDEBEC',
  warning: '#D98206',
  warningSoft: '#FEF1D6',

  category: {
    blue: { fg: '#2F6BFF', bg: '#E5EEFF' },
    orange: { fg: '#F07A1A', bg: '#FFEBDA' },
    green: { fg: '#16A367', bg: '#E3F6ED' },
    pink: { fg: '#E5439B', bg: '#FDE6F2' },
    purple: { fg: '#8B5CF6', bg: '#EFE8FE' },
    teal: { fg: '#0E9AA7', bg: '#DDF4F6' },
  },
} as const;

export type CategoryColor = keyof typeof colors.category;
