import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, commuterTheme } from '@jeepneygo/ui';
import { QueryProvider, useAuthStore } from '@jeepneygo/core';

function RootLayoutContent() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <StatusBar style="dark" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <ThemeProvider customTheme={commuterTheme}>
        <RootLayoutContent />
      </ThemeProvider>
    </QueryProvider>
  );
}
