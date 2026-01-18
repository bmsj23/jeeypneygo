import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme, IconButton, Divider, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Card } from '@jeepneygo/ui';
import {
  useActiveTrips,
  useStops,
  useFavorites,
  useAuthStore,
  calculateETA,
  formatETA,
  getTimeAgo,
  isLocationStale,
  type ActiveTripWithDetails,
} from '@jeepneygo/core';

interface ApproachingJeepney {
  trip: ActiveTripWithDetails;
  etaMinutes: number;
  isStale: boolean;
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

  // find the selected stop
  const stop = useMemo(() => {
    return stops.find((s) => s.id === stopId);
  }, [stops, stopId]);

  // calculate approaching jeepneys with eta
  const approachingJeepneys = useMemo((): ApproachingJeepney[] => {
    if (!stop || !trips.length) return [];

    // filter trips on the same route
    const routeTrips = trips.filter((trip) => trip.route_id === stop.route_id);

    // calculate eta for each trip
    const withEta = routeTrips
      .filter((trip) => trip.current_latitude && trip.current_longitude)
      .map((trip) => {
        const etaMinutes = calculateETA(
          { latitude: trip.current_latitude!, longitude: trip.current_longitude! },
          { latitude: stop.latitude, longitude: stop.longitude }
        );
        return {
          trip,
          etaMinutes,
          isStale: trip.last_updated ? isLocationStale(trip.last_updated) : false,
        };
      })
      // sort by eta
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

  const renderJeepneyItem = ({ item }: { item: ApproachingJeepney }) => {
    const { trip, etaMinutes, isStale } = item;
    const routeColor = trip.route?.color || '#FFB800';
    const maxCapacity = trip.vehicle?.capacity || 20;
    const passengerCount = trip.passenger_count || 0;
    const availableSeats = Math.max(0, maxCapacity - passengerCount);

    return (
      <Card style={StyleSheet.flatten([styles.jeepneyCard, isStale && styles.staleCard])}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={[styles.routeIndicator, { backgroundColor: routeColor }]} />
            <View style={styles.jeepneyInfo}>
              <Text variant="titleMedium" style={styles.plateNumber}>
                {trip.vehicle?.plate_number || 'Unknown'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {trip.driver?.display_name || 'Unknown Driver'}
              </Text>
            </View>
          </View>

          <View style={styles.cardRight}>
            <Text
              variant="headlineMedium"
              style={[styles.etaText, { color: etaMinutes <= 5 ? '#4CAF50' : theme.colors.primary }]}
            >
              {formatETA(etaMinutes)}
            </Text>
            <View style={styles.seatInfo}>
              <Text variant="bodySmall" style={{ color: availableSeats > 0 ? '#4CAF50' : theme.colors.error }}>
                {availableSeats > 0 ? `${availableSeats} seats` : 'Full'}
              </Text>
            </View>
          </View>
        </View>

        {isStale && (
          <View style={styles.staleWarning}>
            <Text variant="labelSmall" style={styles.staleText}>
              Location may be outdated ({getTimeAgo(trip.last_updated!)})
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton icon="bus-clock" size={48} iconColor={theme.colors.onSurfaceVariant} />
      <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        No approaching jeepneys
      </Text>
      <Text
        variant="bodySmall"
        style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}
      >
        There are no active jeepneys on this route right now
      </Text>
    </View>
  );

  return (
    <ScreenContainer>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <Text variant="titleLarge" style={styles.stopName} numberOfLines={1}>
            {stopName || stop?.name || 'Stop Details'}
          </Text>
          {'route' in (stop || {}) && (stop as any).route && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {(stop as any).route.name}
            </Text>
          )}
        </View>
        {isAuthenticated && (
          <IconButton
            icon={isFav ? 'heart' : 'heart-outline'}
            iconColor={isFav ? theme.colors.error : undefined}
            size={24}
            onPress={handleFavoriteToggle}
          />
        )}
      </View>

      <Divider />

      {/* approaching jeepneys list */}
      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Approaching Jeepneys
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={approachingJeepneys}
            keyExtractor={(item) => item.trip.id}
            renderItem={renderJeepneyItem}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={approachingJeepneys.length === 0 ? styles.emptyContainer : undefined}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
  },
  stopName: {
    fontWeight: 'bold',
    color: '#1A237E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A237E',
  },
  jeepneyCard: {
    marginBottom: 12,
  },
  staleCard: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: 12,
  },
  jeepneyInfo: {
    flex: 1,
  },
  plateNumber: {
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  etaText: {
    fontWeight: 'bold',
  },
  seatInfo: {
    marginTop: 4,
  },
  staleWarning: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  staleText: {
    color: '#E65100',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
