import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

// Material palette values.
export const palette = {
  amber: '#FFC107',
  amber300: '#FFD54F',
  amberAccent: '#FFD740',
  blue: '#2196F3',
  blue900: '#0D47A1',
  black: '#000000',
  white: '#FFFFFF',
  pink: '#E91E63',
  red: '#F44336',
} as const;

/**
 * Global Material 3 theme.
 *
 * Primary: amber. Secondary / app bar: blue[900].
 * Bottom tab bar: amber accent background with blue selected item.
 */
export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.amber,
    onPrimary: palette.black,
    primaryContainer: palette.amber300,
    onPrimaryContainer: palette.black,
    secondary: palette.blue900,
    onSecondary: palette.white,
    tertiary: palette.amber300,
  },
};

export const appBarTheme = {
  backgroundColor: palette.blue900,
  tintColor: palette.white,
} as const;

export const tabBarTheme = {
  backgroundColor: palette.amberAccent,
  activeTintColor: palette.blue,
  inactiveTintColor: palette.black,
} as const;
