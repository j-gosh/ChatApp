import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

/** Semantic app colors. Screens use these instead of hardcoded hex values. */
export const colors = {
  primary: '#5B5BD6',
  onPrimary: '#FFFFFF',
  primaryContainer: '#ECECFD',
  onPrimaryContainer: '#23236B',
  accent: '#C25BD6',
  background: '#F7F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#EFEFF4',
  text: '#1C1C28',
  textMuted: '#8A8A9E',
  outline: '#D9D9E3',
  danger: '#E5484D',
  success: '#30A46C',
} as const;

/**
 * Global Material 3 theme.
 *
 * Primary: indigo. Accent: violet. White app bar and tab bar with dark text.
 */
export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.primaryContainer,
    onPrimaryContainer: colors.onPrimaryContainer,
    secondary: colors.accent,
    onSecondary: colors.onPrimary,
    secondaryContainer: colors.primaryContainer,
    onSecondaryContainer: colors.onPrimaryContainer,
    tertiary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.surfaceVariant,
    onSurfaceVariant: colors.textMuted,
    onBackground: colors.text,
    outline: colors.outline,
    error: colors.danger,
  },
};

export const appBarTheme = {
  backgroundColor: colors.surface,
  tintColor: colors.text,
} as const;

export const tabBarTheme = {
  backgroundColor: colors.surface,
  activeTintColor: colors.primary,
  inactiveTintColor: colors.textMuted,
} as const;
