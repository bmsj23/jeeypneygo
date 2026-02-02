import { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@jeepneygo/core';

export default function RootIndex() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [roleError, setRoleError] = useState(false);
  const [hasShownAlert, setHasShownAlert] = useState(false);

  const isWrongRole = isAuthenticated && user && user.role !== 'driver';

  useEffect(() => {
    if (isWrongRole && !hasShownAlert) {
      setHasShownAlert(true);
      setRoleError(true);
      Alert.alert(
        'Wrong App',
        'This account is registered as a commuter. Please use the Commuter app instead.',
        [
          {
            text: 'Sign Out',
            onPress: async () => {
              await signOut();
              setRoleError(false);
              setHasShownAlert(false);
            },
          },
        ]
      );
    }
  }, [isWrongRole, hasShownAlert, signOut]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  if (isWrongRole || roleError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>This app is for drivers only.</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user && user.role === 'driver' && !user.is_approved) {
    return <Redirect href="/(auth)/pending-approval" />;
  }

  return <Redirect href={'/(main)' as any} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
