import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@jeepneygo/core';

export default function RootIndex() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // show loading while checking auth state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  // redirect based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // check if driver is approved
  if (user && user.role === 'driver' && !user.is_approved) {
    return <Redirect href="/(auth)/pending-approval" />;
  }

  // authenticated and approved - go to main app
  return <Redirect href={'/(main)' as any} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
