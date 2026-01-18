import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Keyboard } from 'react-native';
import { Text, useTheme, FAB, Chip, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  useAuthStore,
  useActiveTrips,
  useRoutes,
  useStops,
  useUserLocation,
  isLocationStale,
  type ActiveTripWithDetails,
  type Route,
  type Stop,
} from '@jeepneygo/core';
import { JeepneyMarker } from '../../components/jeepney-marker';
import { JeepneyDetailsSheet } from '../../components/jeepney-details-sheet';

const { width, height } = Dimensions.get('window');

// lipa city bounds for initial region
const LIPA_REGION: Region = {
  latitude: 13.9411,
  longitude: 121.1625,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { location: userLocation, refreshLocation, isLoading: locationLoading } = useUserLocation();
  const { routes, isLoading: routesLoading } = useRoutes();
  const { trips, isLoading: tripsLoading } = useActiveTrips();

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<ActiveTripWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // filter stops based on search
  const { stops: searchResults } = useStops({
    searchQuery: searchQuery.length >= 2 ? searchQuery : undefined,
    includeRoute: true,
  });

  // filter trips by selected route
  const filteredTrips = useMemo(() => {
    if (!selectedRouteId) return trips;
    return trips.filter((trip) => trip.route_id === selectedRouteId);
  }, [trips, selectedRouteId]);

  // center map on user location when it becomes available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [userLocation]);

  const handleRouteFilter = useCallback((routeId: string | null) => {
    setSelectedRouteId(routeId);
  }, []);

  const handleMarkerPress = useCallback((trip: ActiveTripWithDetails) => {
    setSelectedTrip(trip);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedTrip(null);
    bottomSheetRef.current?.close();
  }, []);

  const handleCenterOnUser = useCallback(async () => {
    await refreshLocation();
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    }
  }, [userLocation, refreshLocation]);

  const handleStopPress = useCallback(
    (stop: Stop) => {
      Keyboard.dismiss();
      setSearchQuery('');
      setIsSearchFocused(false);

      // navigate to stop details screen
      router.push({
        pathname: '/stop-details' as any,
        params: { stopId: stop.id, stopName: stop.name },
      });
    },
    [router]
  );

  const isLoading = routesLoading || tripsLoading || locationLoading;

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* map view */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={LIPA_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {filteredTrips.map((trip) => (
          <JeepneyMarker
            key={trip.id}
            trip={trip}
            isStale={trip.last_updated ? isLocationStale(trip.last_updated) : false}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* search bar overlay */}
      <View style={[styles.searchContainer, { top: insets.top + 16 }]}>
        <Searchbar
          placeholder="Search stops..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          style={styles.searchbar}
          elevation={2}
        />

        {/* search results dropdown */}
        {isSearchFocused && searchQuery.length >= 2 && (
          <View style={[styles.searchResults, { backgroundColor: theme.colors.surface }]}>
            {searchResults.length === 0 ? (
              <Text style={styles.noResults}>No stops found</Text>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.resultsList}>
                {searchResults.slice(0, 5).map((stop) => (
                  <View key={stop.id}>
                    <Text
                      style={styles.resultItem}
                      onPress={() => handleStopPress(stop as Stop)}
                    >
                      {stop.name}
                      {'route' in stop && (stop as any).route && (
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                          {' '}
                          - {((stop as any).route as Route).short_name}
                        </Text>
                      )}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* route filter chips */}
      <View style={[styles.filtersContainer, { top: insets.top + 80 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <Chip
            selected={selectedRouteId === null}
            onPress={() => handleRouteFilter(null)}
            style={[styles.filterChip, selectedRouteId === null && styles.filterChipSelected]}
            textStyle={styles.filterChipText}
          >
            All Routes
          </Chip>
          {routes.map((route) => (
            <Chip
              key={route.id}
              selected={selectedRouteId === route.id}
              onPress={() => handleRouteFilter(route.id)}
              style={[
                styles.filterChip,
                { borderColor: route.color || '#FFB800' },
                selectedRouteId === route.id && { backgroundColor: route.color || '#FFB800' },
              ]}
              textStyle={[
                styles.filterChipText,
                selectedRouteId === route.id && { color: '#FFFFFF' },
              ]}
            >
              {route.short_name || route.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* loading indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      {/* active jeepneys count */}
      <View style={[styles.countBadge, { top: insets.top + 130 }]}>
        <Text variant="labelSmall" style={styles.countText}>
          {filteredTrips.length} jeepney{filteredTrips.length !== 1 ? 's' : ''} active
        </Text>
      </View>

      {/* guest mode banner */}
      {!isAuthenticated && (
        <View style={[styles.guestBanner, { bottom: insets.bottom + 80 }]}>
          <Text variant="bodySmall" style={styles.guestText}>
            You're in Guest Mode. Sign in to save favorites.
          </Text>
        </View>
      )}

      {/* current location fab */}
      <FAB
        icon="crosshairs-gps"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={handleCenterOnUser}
        size="medium"
      />

      {/* jeepney details bottom sheet */}
      <JeepneyDetailsSheet ref={bottomSheetRef} trip={selectedTrip} onClose={handleSheetClose} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  searchContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchbar: {
    borderRadius: 12,
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultsList: {
    padding: 8,
  },
  resultItem: {
    padding: 12,
    fontSize: 14,
  },
  noResults: {
    padding: 16,
    textAlign: 'center',
    color: '#757575',
  },
  filtersContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    height: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipSelected: {
    backgroundColor: '#FFB800',
    borderColor: '#FFB800',
  },
  filterChipText: {
    fontSize: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 180,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
  countBadge: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countText: {
    color: '#FFFFFF',
  },
  guestBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  guestText: {
    color: '#E65100',
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
});
