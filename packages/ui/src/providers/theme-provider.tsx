import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme, type AppTheme } from '../theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  customTheme?: AppTheme;
}

export function ThemeProvider({ children, customTheme }: ThemeProviderProps) {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={customTheme || theme}>
        {children}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
