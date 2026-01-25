import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { JeepneyETACard, SectionHeader, EmptyState } from '@jeepneygo/ui';
import {
  useActiveTrips,
  useStops,
  useFavorites,
  useAuthStore,
  calculateETA,
  isLocationStale,
  type ActiveTripWithDetails,
  type Route,
} from '@jeepneygo/core';

interface ApproachingJeepney {
  trip: ActiveTripWithDetails;
  etaMinutes: number;
  isStale: boolean;
  distance: string;
}

export default function StopDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stopId, stopName } = useLocalSearchParams<{ stopId: string; stopName: string }>();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { stops, isLoading: stopsLoading } = useStops({ includeRoute: true });
  const { trips, isLoading: tripsLoading } = useActiveTrips();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const stop = useMemo(() => {
    return stops.find((s) => s.id === stopId);
  }, [stops, stopId]);

  const route = stop ? (stop as any).route as Route | undefined : undefined;

  const approachingJeepneys = useMemo((): ApproachingJeepney[] => {
    if (!stop || !trips.length) return [];

    const routeTrips = trips.filter((trip) => trip.route_id === stop.route_id);

    const withEta = routeTrips
      .filter((trip) => trip.current_latitude && trip.current_longitude)
      .map((trip) => {
        const etaMinutes = calculateETA(
          { latitude: trip.current_latitude!, longitude: trip.current_longitude! },
          { latitude: stop.latitude, longitude: stop.longitude }
        );
        const R = 6371;
        const dLat = ((stop.latitude - trip.current_latitude!) * Math.PI) / 180;
        const dLon = ((stop.longitude - trip.current_longitude!) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((trip.current_latitude! * Math.PI) / 180) * Math.cos((stop.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return {
          trip,
          etaMinutes,
          isStale: trip.last_updated ? isLocationStale(trip.last_updated) : false,
          distance: distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`,
        };
      })
      .sort((a, b) => a.etaMinutes - b.etaMinutes);

    return withEta;
  }, [stop, trips]);

  const handleFavoriteToggle = async () => {
    if (!stopId) return;
    if (isFavorite(stopId)) {
      await removeFavorite(stopId);
    } else {
      await addFavorite(stopId);
    }
  };

  const isLoading = stopsLoading || tripsLoading;
  const isFav = stopId ? isFavorite(stopId) : false;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: route?.color || theme.colors.primary }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          {isAuthenticated && (
            <Pressable onPress={handleFavoriteToggle} style={styles.favoriteButton}>
              <MaterialCommunityIcons
                name={isFav ? 'heart' : 'heart-outline'}
                size={24}
                color={isFav ? '#E91E63' : '#FFFFFF'}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.headerContent}>
          <View style={[styles.stopIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <MaterialCommunityIcons name="map-marker" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.stopName} numberOfLines={2}>
            {stopName || stop?.name || 'Stop Details'}
          </Text>
          {route && (
            <View style={styles.routeBadge}>
              <Text style={styles.routeText}>{route.name}</Text>
            </View>
          )}
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: approachingJeepneys.length > 0 ? '#4CAF50' : theme.colors.onSurfaceVariant }]}>
              {approachingJeepneys.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              Approaching
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {approachingJeepneys[0]?.etaMinutes ?? '-'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              Min ETA
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
              ₱{route?.base_fare?.toFixed(0) || '13'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              Base Fare
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Finding jeepneys...
          </Text>
        </View>
      ) : (
        <FlatList
          data={approachingJeepneys}
          keyExtractor={(item) => item.trip.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <SectionHeader
              title="Approaching Jeepneys"
              subtitle={approachingJeepneys.length > 0 ? `${approachingJeepneys.length} on the way` : 'None nearby'}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                type="no-trips"
                title="No jeepneys approaching"
                description="There are no active jeepneys on this route right now. Check back in a few minutes."
              />
            </View>
          }
          renderItem={({ item }) => {
            const { trip, etaMinutes, isStale, distance } = item;
            const maxCapacity = trip.vehicle?.capacity || 20;
            const passengerCount = trip.passenger_count || 0;
            const availableSeats = Math.max(0, maxCapacity - passengerCount);

            return (
              <View style={styles.cardWrapper}>
                <JeepneyETACard
                  plateNumber={trip.vehicle?.plate_number || 'Unknown'}
                  driverName={trip.driver?.display_name || undefined}
                  routeName={route?.name || 'Unknown Route'}
                  routeColor={route?.color || '#FFB800'}
                  etaMinutes={etaMinutes}
                  availableSeats={availableSeats}
                  maxSeats={maxCapacity}
                  distance={distance}
                  isStale={isStale}
                />
              </View>
            );
          }}
        />
      )}
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
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stopIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stopName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  routeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
  list: {
    paddingTop: 40,
    paddingBottom: 100,
  },
  cardWrapper: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
