import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore, useDriverVehicle, useRoutes } from '@jeepneygo/core';
import {
  VehicleEmptyState,
  VehicleHeroCard,
  VehicleDetailsCard,
  VehicleRouteCard,
  VehicleInfoNotice,
} from '../components/vehicle';

export default function VehicleInfoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const { vehicle, isLoading, refetch } = useDriverVehicle(user?.id);
  const { routes } = useRoutes({ activeOnly: true });
  const [refreshing, setRefreshing] = useState(false);

  const assignedRoute = routes.find((r) => r.id === vehicle?.route_id);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const headerOptions = {
    headerShown: true,
    headerTitle: 'Vehicle Information',
    headerTitleStyle: { fontWeight: '600' as const },
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.colors.background },
    headerLeft: () => (
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
      </Pressable>
    ),
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {!vehicle ? (
          <VehicleEmptyState onContactSupport={() => router.push('/support')} />
        ) : (
          <>
            <VehicleHeroCard vehicle={vehicle} />
            <VehicleDetailsCard vehicle={vehicle} />
            <VehicleRouteCard route={assignedRoute} />
            <VehicleInfoNotice onRequestChange={() => router.push('/support')} />
          </>
        )}
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
