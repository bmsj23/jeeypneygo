import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Keyboard, Pressable, Platform } from 'react-native';
import { Text, useTheme, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  SearchBar,
  SearchBarHero,
  RouteFilterChip,
  RouteFilterBar,
  JeepneyETACard,
  SectionHeader,
  QuickActionButton,
  QuickActionsRow,
  StopCard,
} from '@jeepneygo/ui';
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

const { width, height } = Dimensions.get('window');

const LIPA_REGION: Region = {
  latitude: 13.9411,
  longitude: 121.1625,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type ViewMode = 'map' | 'search';

export default function MapScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { location: userLocation, refreshLocation, isLoading: locationLoading } = useUserLocation();
  const { routes, isLoading: routesLoading } = useRoutes();

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<ActiveTripWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(height * 0.35);
  const isChangingRouteRef = useRef(false);
  const connectionStableRef = useRef(false);

  const { trips, isLoading: tripsLoading, connectionState } = useActiveTrips({
    routeId: selectedRouteId || undefined,
  });

  useEffect(() => {
    if (connectionState === 'connected' && !connectionStableRef.current) {
      connectionStableRef.current = true;
    }
  }, [connectionState]);

  useEffect(() => {
    if (isChangingRouteRef.current) {
      if (connectionState === 'connected') {
        isChangingRouteRef.current = false;
      }
      return;
    }
    if (!connectionStableRef.current) return;
    if (connectionState === 'error' || connectionState === 'disconnected') {
      setShowConnectionError(true);
    } else if (connectionState === 'connected') {
      if (showConnectionError) {
        setShowConnectionError(false);
        setShowReconnected(true);
      }
    }
  }, [connectionState, showConnectionError]);

  const { stops: searchResults } = useStops({
    searchQuery: searchQuery.length >= 2 ? searchQuery : undefined,
    includeRoute: true,
  });

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [userLocation]);

  const routeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    trips.forEach(trip => {
      counts[trip.route_id] = (counts[trip.route_id] || 0) + 1;
    });
    return counts;
  }, [trips]);

  const nearbyJeepneys = useMemo(() => {
    return trips.slice(0, 5).map(trip => ({
      ...trip,
      etaMinutes: Math.floor(Math.random() * 15) + 1,
      distance: `${(Math.random() * 2 + 0.1).toFixed(1)} km`,
    }));
  }, [trips]);

  const handleRouteFilter = useCallback((routeId: string | null) => {
    isChangingRouteRef.current = true;
    setSelectedRouteId(routeId);
  }, []);

  const handleMarkerPress = useCallback((trip: ActiveTripWithDetails) => {
    setSelectedTrip(trip);
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    const percentages = [0.35, 0.60, 0.90];
    setBottomSheetHeight(height * (percentages[index] ?? 0.35));
    if (index === -1) {
      setSelectedTrip(null);
    }
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

  const handleStopPress = useCallback((stop: Stop) => {
    Keyboard.dismiss();
    setSearchQuery('');
    setViewMode('map');
    router.push({
      pathname: '/stop-details' as any,
      params: { stopId: stop.id, stopName: stop.name },
    });
  }, [router]);

  const handleSearchPress = useCallback(() => {
    setViewMode('search');
  }, []);

  const handleSearchBack = useCallback(() => {
    setViewMode('map');
    setSearchQuery('');
    Keyboard.dismiss();
  }, []);

  const handleJeepneyCardPress = useCallback((trip: ActiveTripWithDetails) => {
    setSelectedTrip(trip);
    bottomSheetRef.current?.snapToIndex(1);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: trip.current_latitude,
        longitude: trip.current_longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, []);

  const mapPadding = useMemo(() => {
    const tabBarHeight = Platform.OS === 'ios' ? 88 : 64;
    return {
      top: insets.top + 80,
      right: 0,
      bottom: bottomSheetHeight + tabBarHeight - 100,
      left: 0,
    };
  }, [bottomSheetHeight, insets.top]);

  const snapPoints = useMemo(() => ['35%', '60%', '90%'], []);
  const isLoading = routesLoading || tripsLoading || locationLoading;

  const getRouteForTrip = useCallback((trip: ActiveTripWithDetails) => {
    return routes.find(r => r.id === trip.route_id);
  }, [routes]);

  // search view
  if (viewMode === 'search') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.searchHeader, { paddingTop: insets.top + 12 }]}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search stops or routes..."
            showBackButton
            onBackPress={handleSearchBack}
            autoFocus
            onClear={() => setSearchQuery('')}
          />
        </View>

        <ScrollView style={styles.searchContent} keyboardShouldPersistTaps="handled">
          {searchQuery.length < 2 ? (
            <>
              <SectionHeader title="Recent Searches" subtitle="Your search history" />
              <View style={styles.emptyRecent}>
                <MaterialCommunityIcons name="history" size={48} color={theme.colors.outlineVariant} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No recent searches
                </Text>
              </View>

              <SectionHeader title="Popular Stops" />
              {searchResults.slice(0, 3).map((stop) => {
                const stopWithRoute = stop as Stop & { route?: Route };
                return (
                  <View key={stop.id} style={styles.searchResultItem}>
                    <StopCard
                      name={stop.name}
                      routeName={stopWithRoute.route?.name}
                      routeColor={stopWithRoute.route?.color}
                      onPress={() => handleStopPress(stop as Stop)}
                    />
                  </View>
                );
              })}
            </>
          ) : (
            <>
              <SectionHeader title="Results" subtitle={`${searchResults.length} stops found`} />
              {searchResults.length === 0 ? (
                <View style={styles.emptyRecent}>
                  <MaterialCommunityIcons name="magnify-close" size={48} color={theme.colors.outlineVariant} />
                  <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                    No stops found for "{searchQuery}"
                  </Text>
                </View>
              ) : (
                searchResults.map((stop) => {
                  const stopWithRoute = stop as Stop & { route?: Route };
                  return (
                    <View key={stop.id} style={styles.searchResultItem}>
                      <StopCard
                        name={stop.name}
                        routeName={stopWithRoute.route?.name}
                        routeColor={stopWithRoute.route?.color}
                        onPress={() => handleStopPress(stop as Stop)}
                      />
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
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
        mapPadding={mapPadding}
      >
        {trips.map((trip) => (
          <JeepneyMarker
            key={trip.id}
            trip={trip}
            isStale={trip.last_updated ? isLocationStale(trip.last_updated) : false}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      <View style={[styles.topOverlay, { paddingTop: insets.top + 12 }]}>
        <View style={styles.searchHeroContainer}>
          <SearchBarHero onPress={handleSearchPress} subtitle={`${trips.length} jeepneys nearby`} />
        </View>

        <RouteFilterBar
          showAllOption
          isAllSelected={selectedRouteId === null}
          onAllPress={() => handleRouteFilter(null)}
        >
          {routes.map((route) => (
            <RouteFilterChip
              key={route.id}
              name={route.name}
              shortName={route.short_name}
              color={route.color || '#FFB800'}
              isSelected={selectedRouteId === route.id}
              activeCount={routeCounts[route.id] || 0}
              onPress={() => handleRouteFilter(route.id)}
            />
          ))}
        </RouteFilterBar>
      </View>

      {isLoading && (
        <View style={[styles.loadingOverlay, { top: insets.top + 160 }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      <Pressable
        onPress={handleCenterOnUser}
        style={[styles.locationButton, { backgroundColor: theme.colors.surface, top: insets.top + 180 }]}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={theme.colors.primary} />
      </Pressable>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.outlineVariant }}
        onChange={handleSheetChange}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {selectedTrip ? (
            <>
              <SectionHeader title="Jeepney Details" />
              {(() => {
                const route = getRouteForTrip(selectedTrip);
                return (
                  <View style={styles.selectedTripCard}>
                    <JeepneyETACard
                      plateNumber={selectedTrip.vehicle?.plate_number || 'Unknown'}
                      driverName={selectedTrip.driver?.display_name || undefined}
                      routeName={route?.name || 'Unknown Route'}
                      routeColor={route?.color || '#FFB800'}
                      etaMinutes={Math.floor(Math.random() * 10) + 1}
                      availableSeats={selectedTrip.vehicle?.capacity ? selectedTrip.vehicle.capacity - selectedTrip.passenger_count : 15}
                      maxSeats={selectedTrip.vehicle?.capacity || 20}
                      distance={`${(Math.random() * 2 + 0.1).toFixed(1)} km`}
                      isStale={selectedTrip.last_updated ? isLocationStale(selectedTrip.last_updated) : false}
                    />

                    <View style={styles.tripActions}>
                      <Pressable
                        onPress={() => {
                          if (route) {
                            router.push({ pathname: '/route-details' as any, params: { routeId: route.id } });
                          }
                        }}
                        style={[styles.tripActionButton, { backgroundColor: theme.colors.primaryContainer }]}
                      >
                        <MaterialCommunityIcons name="map-marker-path" size={20} color={theme.colors.primary} />
                        <Text style={[styles.tripActionText, { color: theme.colors.primary }]}>View Route</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setSelectedTrip(null);
                          bottomSheetRef.current?.snapToIndex(0);
                        }}
                        style={[styles.tripActionButton, { backgroundColor: theme.colors.surfaceVariant }]}
                      >
                        <MaterialCommunityIcons name="close" size={20} color={theme.colors.onSurfaceVariant} />
                        <Text style={[styles.tripActionText, { color: theme.colors.onSurfaceVariant }]}>Close</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })()}
            </>
          ) : (
            <>
              <QuickActionsRow>
                <QuickActionButton icon="map-marker-multiple" label="All Stops" onPress={() => router.push('/routes')} color="#4CAF50" />
                <QuickActionButton icon="heart" label="Favorites" onPress={() => router.push('/favorites')} color="#E91E63" />
                <QuickActionButton icon="bus-clock" label="Routes" onPress={() => router.push('/routes')} color="#2196F3" />
                <QuickActionButton icon="account" label="Profile" onPress={() => router.push('/profile')} color="#9C27B0" />
              </QuickActionsRow>

              {!isAuthenticated && (
                <Pressable
                  onPress={() => router.push('/(auth)/login' as any)}
                  style={[styles.guestBanner, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  <MaterialCommunityIcons name="account-plus" size={24} color={theme.colors.primary} />
                  <View style={styles.guestBannerText}>
                    <Text style={[styles.guestTitle, { color: theme.colors.primary }]}>Sign in for more features</Text>
                    <Text style={[styles.guestSubtitle, { color: theme.colors.onPrimaryContainer }]}>
                      Save favorites, get notifications
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.primary} />
                </Pressable>
              )}

              <SectionHeader
                title="Nearby Jeepneys"
                subtitle={`${trips.length} active now`}
                actionLabel="See map"
                onActionPress={() => bottomSheetRef.current?.snapToIndex(0)}
              />

              {nearbyJeepneys.length === 0 ? (
                <View style={styles.emptyNearby}>
                  <MaterialCommunityIcons name="bus-alert" size={48} color={theme.colors.outlineVariant} />
                  <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No jeepneys nearby</Text>
                </View>
              ) : (
                nearbyJeepneys.map((trip) => {
                  const route = getRouteForTrip(trip);
                  return (
                    <View key={trip.id} style={styles.jeepneyCardWrapper}>
                      <JeepneyETACard
                        plateNumber={trip.vehicle?.plate_number || 'Unknown'}
                        driverName={trip.driver?.display_name || undefined}
                        routeName={route?.name || 'Unknown Route'}
                        routeColor={route?.color || '#FFB800'}
                        etaMinutes={trip.etaMinutes}
                        availableSeats={trip.vehicle?.capacity ? trip.vehicle.capacity - trip.passenger_count : 15}
                        maxSeats={trip.vehicle?.capacity || 20}
                        distance={trip.distance}
                        isStale={trip.last_updated ? isLocationStale(trip.last_updated) : false}
                        onPress={() => handleJeepneyCardPress(trip)}
                        onTrack={() => handleJeepneyCardPress(trip)}
                      />
                    </View>
                  );
                })
              )}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      <Snackbar
        visible={showConnectionError}
        onDismiss={() => setShowConnectionError(false)}
        duration={Snackbar.DURATION_LONG}
        action={{ label: 'Dismiss', onPress: () => setShowConnectionError(false) }}
        style={styles.snackbar}
      >
        {connectionState === 'connecting' ? 'Reconnecting to live updates...' : 'Live updates unavailable.'}
      </Snackbar>

      <Snackbar visible={showReconnected} onDismiss={() => setShowReconnected(false)} duration={3000} style={styles.reconnectedSnackbar}>
        Connected! Live updates restored.
      </Snackbar>
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
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  searchHeroContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sheetContent: {
    paddingBottom: 100,
  },
  selectedTripCard: {
    paddingHorizontal: 20,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  tripActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  tripActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  guestBannerText: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  guestSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyNearby: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  jeepneyCardWrapper: {
    paddingHorizontal: 20,
  },
  snackbar: {
    marginBottom: 120,
  },
  reconnectedSnackbar: {
    backgroundColor: '#4CAF50',
    marginBottom: 120,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchContent: {
    flex: 1,
  },
  searchResultItem: {
    paddingHorizontal: 20,
  },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
});
