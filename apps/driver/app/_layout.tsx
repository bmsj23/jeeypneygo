import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, driverTheme, ToastContainer } from '@jeepneygo/ui';
import { QueryProvider, useAuthStore, useToastStore } from '@jeepneygo/core';

function RootLayoutContent() {
  const initialize = useAuthStore((state) => state.initialize);
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="edit-profile" options={{ headerShown: true }} />
        <Stack.Screen name="vehicle-info" options={{ headerShown: true }} />
        <Stack.Screen name="license-details" options={{ headerShown: true }} />
        <Stack.Screen name="history" options={{ headerShown: true }} />
        <Stack.Screen name="earnings" options={{ headerShown: true }} />
        <Stack.Screen name="notifications" options={{ headerShown: true }} />
        <Stack.Screen name="support" options={{ headerShown: true }} />
        <Stack.Screen name="about" options={{ headerShown: true }} />
      </Stack>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <ThemeProvider customTheme={driverTheme}>
        <RootLayoutContent />
      </ThemeProvider>
    </QueryProvider>
  );
}
