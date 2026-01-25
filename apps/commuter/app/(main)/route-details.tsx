import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useRoutes,
  useActiveTrips,
  useFavorites,
  useAuthStore,
  type RouteWithStops,
  type Stop,
} from '@jeepneygo/core';
import {
  RouteHeader,
  FareInfoCard,
  ViewModeTabs,
  StopsList,
  JeepneysList,
  type ViewMode,
} from '../../components/route';

export default function RouteDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routeId, routeName } = useLocalSearchParams<{ routeId: string; routeName: string }>();

  const [viewMode, setViewMode] = useState<ViewMode>('stops');

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { routes, isLoading: routesLoading } = useRoutes({ includeStops: true });
  const { trips, isLoading: tripsLoading } = useActiveTrips(routeId);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const route = useMemo(() => {
    return routes.find((r) => r.id === routeId) as RouteWithStops | undefined;
  }, [routes, routeId]);

  const handleStopPress = (stop: Stop) => {
    router.push({
      pathname: '/stop-details' as any,
      params: { stopId: stop.id, stopName: stop.name },
    });
  };

  const handleFavoriteToggle = async (stopId: string) => {
    if (isFavorite(stopId)) {
      await removeFavorite(stopId);
    } else {
      await addFavorite(stopId);
    }
  };

  const routeColor = route?.color || '#FFB800';
  const isLoading = routesLoading || tripsLoading;
  const totalPassengers = trips.reduce((sum, t) => sum + (t.passenger_count || 0), 0);

  // handle loading and not found states
  if (isLoading && !route) {
    return (
      <RouteHeader
        route={undefined}
        routeColor={routeColor}
        activeTripsCount={0}
        totalPassengers={0}
        isLoading={true}
        paddingTop={insets.top}
        onBack={() => router.back()}
      />
    );
  }

  if (!route) {
    return (
      <RouteHeader
        route={undefined}
        routeName={routeName}
        routeColor={routeColor}
        activeTripsCount={0}
        totalPassengers={0}
        isLoading={false}
        paddingTop={insets.top}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <RouteHeader
        route={route}
        routeName={routeName}
        routeColor={routeColor}
        activeTripsCount={trips.length}
        totalPassengers={totalPassengers}
        isLoading={isLoading}
        paddingTop={insets.top}
        onBack={() => router.back()}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FareInfoCard route={route} routeColor={routeColor} />

        <ViewModeTabs
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          stopsCount={route.stops?.length || 0}
          jeepneysCount={trips.length}
          routeColor={routeColor}
        />

        {viewMode === 'stops' ? (
          <StopsList
            stops={route.stops}
            routeName={route.name}
            routeColor={routeColor}
            isAuthenticated={isAuthenticated}
            isFavorite={isFavorite}
            onStopPress={handleStopPress}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ) : (
          <JeepneysList
            trips={trips}
            routeName={route.name}
            routeColor={routeColor}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 100,
  },
});
