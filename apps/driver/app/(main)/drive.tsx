import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Alert, Pressable, Platform } from 'react-native';
import { Text, useTheme, ActivityIndicator, Snackbar, Portal, Modal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Button,
  RouteCard,
  PassengerStepper,
  TripTimer,
  EarningsBadge,
  EmptyState,
} from '@jeepneygo/ui';
import {
  useAuthStore,
  useTripStore,
  useRoutes,
  useDriverVehicle,
  useLocationTracking,
  useNetworkStatus,
  useActiveTrips,
  type Route,
  type TripSummary,
} from '@jeepneygo/core';

const { width, height } = Dimensions.get('window');

const MANILA_REGION: Region = {
  latitude: 14.5995,
  longitude: 120.9842,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

type DriveState = 'idle' | 'selecting-route' | 'active' | 'summary';

export default function DriveScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // trip store
  const {
    activeTrip,
    selectedRoute,
    isStartingTrip,
    isEndingTrip,
    setSelectedRoute,
    setVehicle,
    startTrip,
    updatePassengerCount,
    updateLocation,
    endTrip,
    pauseTrip,
    resumeTrip,
  } = useTripStore();

  // hooks
  const { routes, isLoading: routesLoading } = useRoutes({ includeStops: true });
  const { vehicle, isLoading: vehicleLoading } = useDriverVehicle(user?.id);
  const { isOnline } = useNetworkStatus();

  // get other drivers on the same route
  const { trips: otherDrivers } = useActiveTrips({
    routeId: activeTrip?.route_id || selectedRoute?.id || undefined,
  });

  // local state
  const [driveState, setDriveState] = useState<DriveState>('idle');
  const [tripSummary, setTripSummary] = useState<TripSummary | null>(null);
  const [tripDuration, setTripDuration] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<Route | null>(null);

  // earnings
  const [todayEarnings] = useState(0);

  // track bottom sheet position for map padding
  const [bottomSheetHeight, setBottomSheetHeight] = useState(height * 0.2);

  // location tracking
  const shouldTrackLocation = driveState !== 'summary';
  const activeTripRef = useRef(activeTrip);
  const updateLocationRef = useRef(updateLocation);

  useEffect(() => {
    activeTripRef.current = activeTrip;
    updateLocationRef.current = updateLocation;
  });

  const handleLocationUpdate = useCallback(
    (location: { latitude: number; longitude: number; heading: number; speed: number }) => {
      if (activeTripRef.current) {
        updateLocationRef.current(location.latitude, location.longitude, location.heading, location.speed);
      }
    },
    []
  );

  const { currentLocation, hasPermission, requestPermission } = useLocationTracking({
    enabled: shouldTrackLocation,
    intervalMs: 10000,
    onLocationUpdate: handleLocationUpdate,
  });

  // request location permission on mount
  useEffect(() => {
    if (hasPermission === null) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // set vehicle in store when loaded
  useEffect(() => {
    if (vehicle) {
      setVehicle(vehicle);
    }
  }, [vehicle, setVehicle]);

  // determine drive state based on active trip
  useEffect(() => {
    if (activeTrip) {
      setDriveState('active');
    } else if (tripSummary) {
      setDriveState('summary');
      setShowSummaryModal(true);
    } else {
      setDriveState('idle');
    }
  }, [activeTrip, tripSummary]);

  // trip duration timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (activeTrip) {
      const startTime = new Date(activeTrip.started_at).getTime();

      const updateDuration = () => {
        const now = Date.now();
        setTripDuration(Math.floor((now - startTime) / 1000));
      };

      updateDuration();
      interval = setInterval(updateDuration, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTrip]);

  // center map on user location
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // bottom sheet snap points
  const snapPoints = useMemo(() => {
    if (driveState === 'active') {
      return ['25%', '50%'];
    }
    if (driveState === 'selecting-route') {
      return ['40%', '75%'];
    }
    return ['20%', '45%'];
  }, [driveState]);

  // handle bottom sheet position changes for map padding
  const handleSheetChange = useCallback((index: number) => {
    // calculate the height based on snap point percentage
    const percentages = driveState === 'active'
      ? [0.25, 0.50]
      : driveState === 'selecting-route'
        ? [0.40, 0.75]
        : [0.20, 0.45];
    const sheetHeight = height * (percentages[index] ?? percentages[0]);
    setBottomSheetHeight(sheetHeight);
  }, [driveState]);

  // calculate map padding to keep marker visible above the bottom sheet
  // add extra padding so marker appears in upper portion of visible map area
  const mapPadding = useMemo(() => {
    const tabBarHeight = Platform.OS === 'ios' ? 88 : 64;
    // bottom padding = sheet height + some extra to position marker in upper visible area
    const bottomPadding = bottomSheetHeight + 40;
    return {
      top: insets.top + 60,
      right: 0,
      bottom: bottomPadding + tabBarHeight,
      left: 0,
    };
  }, [bottomSheetHeight, insets.top]);

  // handlers
  const handleGoOnline = () => {
    setDriveState('selecting-route');
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleSelectRoute = async (route: Route) => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('Location Required', 'Location permission is required to start a trip.');
        return;
      }
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    if (!vehicle) {
      Alert.alert('No Vehicle', 'You do not have a vehicle assigned. Please contact admin.');
      return;
    }

    let locationToUse: { latitude: number; longitude: number; heading: number; speed: number } | null =
      currentLocation;

    if (!locationToUse) {
      setIsGettingLocation(true);
      setPendingRoute(route);
      try {
        const Location = await import('expo-location');
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        locationToUse = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          heading: loc.coords.heading ?? 0,
          speed: loc.coords.speed ?? 0,
        };
      } catch {
        Alert.alert('Location Error', 'Unable to get your current location.');
        setIsGettingLocation(false);
        setPendingRoute(null);
        return;
      }
      setIsGettingLocation(false);
      setPendingRoute(null);
    }

    if (!locationToUse) {
      Alert.alert('Location Error', 'Unable to get your current location.');
      return;
    }

    setSelectedRoute(route);

    const result = await startTrip({
      driverId: user.id,
      vehicleId: vehicle.id,
      routeId: route.id,
      latitude: locationToUse.latitude,
      longitude: locationToUse.longitude,
    });

    if (!result.success) {
      Alert.alert('Error', result.error?.message || 'Failed to start trip');
    } else {
      bottomSheetRef.current?.snapToIndex(0);
    }
  };

  const handlePassengerIncrement = () => {
    if (!activeTrip) return;
    const maxCapacity = vehicle?.capacity ?? 20;
    if (activeTrip.passenger_count < maxCapacity) {
      updatePassengerCount(activeTrip.passenger_count + 1);
    }
  };

  const handlePassengerDecrement = () => {
    if (!activeTrip) return;
    if (activeTrip.passenger_count > 0) {
      updatePassengerCount(activeTrip.passenger_count - 1);
    }
  };

  const handleTogglePause = async () => {
    if (!activeTrip) return;
    if (activeTrip.status === 'paused') {
      await resumeTrip();
    } else {
      await pauseTrip();
    }
  };

  const handleEndTrip = () => {
    Alert.alert('End Trip', 'Are you sure you want to end this trip?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Trip',
        style: 'destructive',
        onPress: async () => {
          const result = await endTrip();
          if (result.success && result.tripSummary) {
            setTripSummary(result.tripSummary);
          } else if (!result.success) {
            Alert.alert('Error', result.error?.message || 'Failed to end trip');
          }
        },
      },
    ]);
  };

  const handleNewTrip = () => {
    setTripSummary(null);
    setSelectedRoute(null);
    setShowSummaryModal(false);
    setDriveState('idle');
  };

  const handleCenterOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // filter out current driver from other drivers list
  const filteredOtherDrivers = useMemo(() => {
    if (!activeTrip) return otherDrivers;
    return otherDrivers.filter((t) => t.driver_id !== user?.id);
  }, [otherDrivers, activeTrip, user?.id]);

  // get current route details
  const currentRoute = useMemo(() => {
    if (activeTrip) {
      return routes.find((r) => r.id === activeTrip.route_id);
    }
    return selectedRoute;
  }, [activeTrip, routes, selectedRoute]);

  // render idle state (go online button)
  const renderIdleSheet = () => (
    <View style={styles.sheetContent}>
      <View style={styles.sheetHeader}>
        <Text style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>Ready to Drive?</Text>
        <Text style={[styles.sheetSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Go online to start accepting trips
        </Text>
      </View>

      <Button mode="contained" onPress={handleGoOnline} style={styles.goOnlineButton}>
        GO ONLINE
      </Button>

      {!vehicle && !vehicleLoading && (
        <View style={[styles.warningBanner, { backgroundColor: theme.colors.errorContainer }]}>
          <MaterialCommunityIcons name="alert" size={20} color={theme.colors.error} />
          <Text style={[styles.warningText, { color: theme.colors.onErrorContainer }]}>
            No vehicle assigned. Contact admin.
          </Text>
        </View>
      )}
    </View>
  );

  // render route selection
  const renderRouteSelectionSheet = () => (
    <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
      <View style={styles.sheetHeader}>
        <Text style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>Select Your Route</Text>
        <Text style={[styles.sheetSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Choose a route to start your trip
        </Text>
      </View>

      {routesLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routeCardsContainer}
        >
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              name={route.name}
              shortName={route.short_name}
              color={route.color}
              operatingHours={`${route.operating_start} - ${route.operating_end}`}
              baseFare={route.base_fare}
              onPress={() => handleSelectRoute(route)}
              isSelected={pendingRoute?.id === route.id}
              isLoading={isGettingLocation && pendingRoute?.id === route.id}
            />
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={() => setDriveState('idle')}
        style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        <Text style={[styles.cancelButtonText, { color: theme.colors.onSurfaceVariant }]}>Cancel</Text>
      </Pressable>
    </BottomSheetScrollView>
  );

  // render active trip controls
  const renderActiveTripSheet = () => (
    <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
      {/* trip timer */}
      <TripTimer
        seconds={tripDuration}
        status={activeTrip?.status === 'paused' ? 'paused' : 'active'}
        routeName={currentRoute?.name}
        routeColor={currentRoute?.color}
      />

      {/* passenger stepper */}
      <View style={styles.passengerSection}>
        <PassengerStepper
          value={activeTrip?.passenger_count ?? 0}
          maxValue={vehicle?.capacity ?? 20}
          onIncrement={handlePassengerIncrement}
          onDecrement={handlePassengerDecrement}
        />
      </View>

      {/* action buttons */}
      <View style={styles.tripActions}>
        <Pressable
          onPress={handleTogglePause}
          style={[
            styles.actionButton,
            { backgroundColor: activeTrip?.status === 'paused' ? '#4CAF50' : theme.colors.surfaceVariant },
          ]}
        >
          <MaterialCommunityIcons
            name={activeTrip?.status === 'paused' ? 'play' : 'pause'}
            size={24}
            color={activeTrip?.status === 'paused' ? '#FFFFFF' : theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: activeTrip?.status === 'paused' ? '#FFFFFF' : theme.colors.onSurfaceVariant },
            ]}
          >
            {activeTrip?.status === 'paused' ? 'Resume' : 'Pause'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleEndTrip}
          disabled={isEndingTrip}
          style={[styles.actionButton, styles.endTripButton, { backgroundColor: theme.colors.error }]}
        >
          {isEndingTrip ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="stop" size={24} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>End Trip</Text>
            </>
          )}
        </Pressable>
      </View>
    </BottomSheetScrollView>
  );

  // render trip summary modal
  const renderSummaryModal = () => (
    <Portal>
      <Modal
        visible={showSummaryModal}
        onDismiss={handleNewTrip}
        contentContainerStyle={[styles.summaryModal, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.summaryContent}>
          <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
          <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>Trip Complete!</Text>

          {tripSummary && (
            <>
              <Text style={[styles.summaryRoute, { color: theme.colors.onSurfaceVariant }]}>
                {tripSummary.routeName}
              </Text>

              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text style={[styles.summaryStatValue, { color: theme.colors.onSurface }]}>
                    {Math.floor(tripSummary.duration / 60)}:{(tripSummary.duration % 60).toString().padStart(2, '0')}
                  </Text>
                  <Text style={[styles.summaryStatLabel, { color: theme.colors.onSurfaceVariant }]}>Duration</Text>
                </View>

                <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outlineVariant }]} />

                <View style={styles.summaryStat}>
                  <Text style={[styles.summaryStatValue, { color: theme.colors.onSurface }]}>
                    {tripSummary.totalPassengers}
                  </Text>
                  <Text style={[styles.summaryStatLabel, { color: theme.colors.onSurfaceVariant }]}>Passengers</Text>
                </View>
              </View>
            </>
          )}

          <Button mode="contained" onPress={handleNewTrip} style={styles.newTripButton}>
            Start New Trip
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={currentLocation ? { ...currentLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 } : MANILA_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        mapPadding={mapPadding}
      >
        {/* current driver marker */}
        {currentLocation && (
          <Marker
            coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.youMarker, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="navigation" size={20} color="#000000" />
            </View>
          </Marker>
        )}

        {/* other drivers markers */}
        {filteredOtherDrivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.current_latitude, longitude: driver.current_longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.otherDriverMarker, { backgroundColor: currentRoute?.color || theme.colors.primary }]}>
              <MaterialCommunityIcons name="bus" size={16} color="#FFFFFF" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* earnings badge */}
      <EarningsBadge amount={todayEarnings} />

      {/* center on user button */}
      <Pressable
        onPress={handleCenterOnUser}
        style={[styles.centerButton, { backgroundColor: theme.colors.surface, top: insets.top + 12 }]}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={theme.colors.primary} />
      </Pressable>

      {/* connection status */}
      {!isOnline && (
        <View style={[styles.offlineBanner, { top: insets.top + 60, backgroundColor: theme.colors.errorContainer }]}>
          <MaterialCommunityIcons name="wifi-off" size={16} color={theme.colors.error} />
          <Text style={[styles.offlineText, { color: theme.colors.onErrorContainer }]}>Offline</Text>
        </View>
      )}

      {/* bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.outlineVariant }}
        onChange={handleSheetChange}
      >
        {driveState === 'idle' && renderIdleSheet()}
        {driveState === 'selecting-route' && renderRouteSelectionSheet()}
        {driveState === 'active' && renderActiveTripSheet()}
      </BottomSheet>

      {/* trip summary modal */}
      {renderSummaryModal()}

      {/* loading overlay */}
      {isStartingTrip && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>Starting trip...</Text>
          </View>
        </View>
      )}
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
  youMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  otherDriverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  centerButton: {
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
  offlineBanner: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sheetContent: {
    padding: 20,
  },
  sheetHeader: {
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
  },
  goOnlineButton: {
    paddingVertical: 8,
    borderRadius: 28,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  routeCardsContainer: {
    paddingBottom: 16,
    gap: 12,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  passengerSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  endTripButton: {
    flex: 1.5,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryModal: {
    margin: 20,
    borderRadius: 24,
    padding: 32,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  summaryRoute: {
    fontSize: 16,
    marginBottom: 24,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  summaryStat: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  summaryStatValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  summaryStatLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 48,
  },
  newTripButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 28,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});
