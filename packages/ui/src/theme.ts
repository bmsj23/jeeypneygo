import { MD3LightTheme, configureFonts } from 'react-native-paper';

const colors = {
  jeepneyYellow: '#FFB800',
  deepBlue: '#1A237E',
  lightGray: '#F5F5F5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  textPrimary: '#212121',
  textSecondary: '#757575',
  white: '#FFFFFF',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.jeepneyYellow,
    primaryContainer: '#FFF3D0',
    secondary: colors.deepBlue,
    secondaryContainer: '#E8EAF6',
    background: colors.lightGray,
    surface: colors.white,
    surfaceVariant: '#EEEEEE',
    error: colors.error,
    errorContainer: '#FFEBEE',
    onPrimary: colors.textPrimary,
    onPrimaryContainer: colors.textPrimary,
    onSecondary: colors.white,
    onSecondaryContainer: colors.deepBlue,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onError: colors.white,
    outline: '#BDBDBD',
    outlineVariant: '#E0E0E0',
  },
  roundness: 12,
  fonts: configureFonts({ config: {} }),
};

export const driverTheme = {
  ...theme,
  colors: {
    ...theme.colors,
  },
};

export const commuterTheme = {
  ...theme,
};

export type AppTheme = typeof theme;
