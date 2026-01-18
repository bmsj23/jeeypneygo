import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@jeepneygo/core';

export default function RootIndex() {
  const isLoading = useAuthStore((state) => state.isLoading);

  // show loading while checking auth state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  // commuter app allows guest mode - go straight to main app
  // auth is optional for viewing the map
  return <Redirect href="/(main)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
