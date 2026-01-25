import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { JeepneyETACard, StopCard, SectionHeader, EmptyState } from '@jeepneygo/ui';
import {
  useRoutes,
  useActiveTrips,
  useFavorites,
  useAuthStore,
  formatFare,
  calculateETA,
  type RouteWithStops,
  type Stop,
} from '@jeepneygo/core';
import { FareEstimator } from '../../components/fare-estimator';

type ViewMode = 'stops' | 'jeepneys';

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

  if (isLoading && !route) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!route) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.primary }]}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.routeName}>Route Not Found</Text>
        </View>
        <View style={styles.loadingContainer}>
          <EmptyState
            type="no-routes"
            title="Route not found"
            description="This route may have been removed or is temporarily unavailable."
          />
        </View>
      </View>
    );
  }

  const totalPassengers = trips.reduce((sum, t) => sum + (t.passenger_count || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: routeColor }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.routeBadge}>
            <Text style={styles.shortName}>{route.short_name}</Text>
          </View>
        </View>

        <View style={styles.headerContent}>
          <View style={[styles.routeIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <MaterialCommunityIcons name="bus" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.routeName} numberOfLines={2}>
            {routeName || route.name}
          </Text>
          <Text style={styles.operatingHours}>
            {route.operating_start && route.operating_end
              ? `${route.operating_start} - ${route.operating_end}`
              : '5:00 AM - 9:00 PM'}
          </Text>
        </View>

        {/* stats card */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: trips.length > 0 ? '#4CAF50' : theme.colors.onSurfaceVariant }]}>
              {trips.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              Active
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {route.stops?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              Stops
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {totalPassengers}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              Riding
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* fare info card */}
        <View style={[styles.fareCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.fareHeader}>
            <MaterialCommunityIcons name="cash" size={20} color={routeColor} />
            <Text style={[styles.fareTitle, { color: theme.colors.onSurface }]}>Fare Information</Text>
          </View>
          <View style={styles.fareContent}>
            <View style={styles.fareItem}>
              <Text style={[styles.fareValue, { color: theme.colors.onSurface }]}>
                {formatFare(route.base_fare || 13)}
              </Text>
              <Text style={[styles.fareLabel, { color: theme.colors.onSurfaceVariant }]}>Base Fare</Text>
            </View>
            <View style={styles.fareItem}>
              <Text style={[styles.fareValue, { color: theme.colors.onSurface }]}>
                +{formatFare(route.per_km_rate || 1.8)}
              </Text>
              <Text style={[styles.fareLabel, { color: theme.colors.onSurfaceVariant }]}>Per KM</Text>
            </View>
          </View>
          <View style={[styles.discountBanner, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="ticket-percent" size={16} color="#4CAF50" />
            <Text style={styles.discountText}>20% discount for students, seniors, and PWD</Text>
          </View>
        </View>

        {/* fare estimator */}
        {route.stops && route.stops.length > 1 && (
          <View style={styles.fareEstimatorContainer}>
            <FareEstimator
              route={route}
              stops={route.stops}
              routeColor={routeColor}
            />
          </View>
        )}

        {/* view mode tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[
              styles.tab,
              { borderColor: viewMode === 'stops' ? routeColor : 'transparent' },
              viewMode === 'stops' && { backgroundColor: `${routeColor}15` },
            ]}
            onPress={() => setViewMode('stops')}
          >
            <MaterialCommunityIcons
              name="map-marker-multiple"
              size={18}
              color={viewMode === 'stops' ? routeColor : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.tabText,
                { color: viewMode === 'stops' ? routeColor : theme.colors.onSurfaceVariant },
              ]}
            >
              Stops ({route.stops?.length || 0})
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              { borderColor: viewMode === 'jeepneys' ? routeColor : 'transparent' },
              viewMode === 'jeepneys' && { backgroundColor: `${routeColor}15` },
            ]}
            onPress={() => setViewMode('jeepneys')}
          >
            <MaterialCommunityIcons
              name="bus"
              size={18}
              color={viewMode === 'jeepneys' ? routeColor : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.tabText,
                { color: viewMode === 'jeepneys' ? routeColor : theme.colors.onSurfaceVariant },
              ]}
            >
              Jeepneys ({trips.length})
            </Text>
          </Pressable>
        </View>

        {/* content based on view mode */}
        {viewMode === 'stops' ? (
          <View style={styles.stopsContainer}>
            <SectionHeader title="Route Stops" subtitle="Tap a stop for details" />
            {route.stops?.map((stop, index) => (
              <View key={stop.id} style={styles.stopWrapper}>
                {/* vertical connector line */}
                {index > 0 && (
                  <View style={[styles.connectorLine, { backgroundColor: routeColor }]} />
                )}
                <StopCard
                  name={stop.name}
                  routeName={route.name}
                  routeColor={routeColor}
                  isFavorite={isFavorite(stop.id)}
                  onPress={() => handleStopPress(stop)}
                  onFavoriteToggle={isAuthenticated ? () => handleFavoriteToggle(stop.id) : undefined}
                />
              </View>
            ))}
            {(!route.stops || route.stops.length === 0) && (
              <EmptyState
                type="no-stops"
                title="No stops available"
                description="Stop information for this route is not yet available."
              />
            )}
          </View>
        ) : (
          <View style={styles.jeepneysContainer}>
            <SectionHeader
              title="Active Jeepneys"
              subtitle={trips.length > 0 ? `${trips.length} on this route` : 'No active jeepneys'}
            />
            {trips.length > 0 ? (
              trips.map((trip) => {
                const maxCapacity = trip.vehicle?.capacity || 20;
                const passengerCount = trip.passenger_count || 0;
                const availableSeats = Math.max(0, maxCapacity - passengerCount);

                return (
                  <View key={trip.id} style={styles.cardWrapper}>
                    <JeepneyETACard
                      plateNumber={trip.vehicle?.plate_number || 'Unknown'}
                      driverName={trip.driver?.display_name || undefined}
                      routeName={route.name}
                      routeColor={routeColor}
                      etaMinutes={0}
                      availableSeats={availableSeats}
                      maxSeats={maxCapacity}
                    />
                  </View>
                );
              })
            ) : (
              <EmptyState
                type="no-trips"
                title="No active jeepneys"
                description="There are no jeepneys currently operating on this route."
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  routeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  shortName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  routeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  operatingHours: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fareCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fareTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  fareContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  fareItem: {
    flex: 1,
    alignItems: 'center',
  },
  fareValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  fareLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    flex: 1,
  },
  fareEstimatorContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopsContainer: {
    paddingHorizontal: 20,
  },
  stopWrapper: {
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    left: 18,
    top: -6,
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  jeepneysContainer: {
    paddingHorizontal: 20,
  },
  cardWrapper: {
    marginBottom: 0,
  },
});
