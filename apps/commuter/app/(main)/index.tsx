import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, Dimensions, Keyboard, Platform } from 'react-native';
import { useTheme, Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SectionHeader } from '@jeepneygo/ui';
import {
  useAuthStore,
  useActiveTrips,
  useRoutes,
  useStops,
  useUserLocation,
  isLocationStale,
  type ActiveTripWithDetails,
  type Stop,
} from '@jeepneygo/core';
import { JeepneyMarker } from '../../components/jeepney-marker';
import {
  SearchView,
  MapTopOverlay,
  MapControls,
  SelectedTripContent,
  DefaultSheetContent,
} from '../../components/home';

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

  const handleCloseSelectedTrip = useCallback(() => {
    setSelectedTrip(null);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleViewRoute = useCallback(() => {
    const route = selectedTrip ? routes.find(r => r.id === selectedTrip.route_id) : undefined;
    if (route) {
      router.push({ pathname: '/route-details' as any, params: { routeId: route.id } });
    }
  }, [selectedTrip, routes, router]);

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

  if (viewMode === 'search') {
    return (
      <SearchView
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBackPress={handleSearchBack}
        onClear={() => setSearchQuery('')}
        searchResults={searchResults}
        onStopPress={handleStopPress}
      />
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

      <MapTopOverlay
        routes={routes}
        selectedRouteId={selectedRouteId}
        tripCount={trips.length}
        routeCounts={routeCounts}
        onSearchPress={() => setViewMode('search')}
        onRouteFilter={handleRouteFilter}
      />

      <MapControls isLoading={isLoading} onCenterUser={handleCenterOnUser} />

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
              <SelectedTripContent
                trip={selectedTrip}
                route={getRouteForTrip(selectedTrip)}
                onViewRoute={handleViewRoute}
                onClose={handleCloseSelectedTrip}
              />
            </>
          ) : (
            <DefaultSheetContent
              isAuthenticated={isAuthenticated}
              nearbyJeepneys={nearbyJeepneys}
              tripCount={trips.length}
              getRouteForTrip={getRouteForTrip}
              onJeepneyPress={handleJeepneyCardPress}
              onCollapseSheet={() => bottomSheetRef.current?.snapToIndex(0)}
            />
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
  sheetContent: {
    paddingBottom: 100,
  },
  snackbar: {
    marginBottom: 120,
  },
  reconnectedSnackbar: {
    backgroundColor: '#4CAF50',
    marginBottom: 120,
  },
});
