import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Alert, Pressable, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EarningsBadge } from '@jeepneygo/ui';
import {
  useAuthStore,
  useTripStore,
  useRoutes,
  useDriverVehicle,
  useLocationTracking,
  useNetworkStatus,
  useActiveTrips,
  isLocationStale,
  type Route,
  type TripSummary,
} from '@jeepneygo/core';
import { CustomBottomSheet, CustomBottomSheetRef } from '../../components/custom-bottom-sheet';
import {
  IdleState,
  RouteSelection,
  ActiveTripControls,
  TripSummaryModal,
  LoadingOverlay,
} from '../../components/drive';
import { DriverSelfMarker } from '../../components/drive/driver-self-marker';
import { JeepneyMarker } from '../../../commuter/components/jeepney-marker';

const { height } = Dimensions.get('window');

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
  const bottomSheetRef = useRef<CustomBottomSheetRef>(null);

  const {
    activeTrip,
    selectedRoute,
    isStartingTrip,
    isEndingTrip,
    setSelectedRoute,
    setVehicle,
    startTrip,
    updateLocation,
    endTrip,
    pauseTrip,
    resumeTrip,
    fareEntries,
    totalFare,
    regularPassengers,
    discountedPassengers,
    currentPassengersOnboard,
    logCustomFare,
    undoLastFare,
    decrementPassenger,
  } = useTripStore();

  const { routes, isLoading: routesLoading } = useRoutes();
  const { vehicle, isLoading: vehicleLoading } = useDriverVehicle(user?.id);
  const { isOnline } = useNetworkStatus();
  const { trips: otherDrivers } = useActiveTrips({
    routeId: activeTrip?.route_id || selectedRoute?.id || undefined,
  });

  const [driveState, setDriveState] = useState<DriveState>('idle');
  const [tripSummary, setTripSummary] = useState<TripSummary | null>(null);
  const [tripDuration, setTripDuration] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<Route | null>(null);
  const [isGoOnlinePressed, setIsGoOnlinePressed] = useState(false);
  const [isFareEntryMode, setIsFareEntryMode] = useState(false);

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

  useEffect(() => {
    if (hasPermission === null) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (vehicle) {
      setVehicle(vehicle);
    }
  }, [vehicle, setVehicle]);

  useEffect(() => {
    if (activeTrip) {
      setDriveState('active');
      bottomSheetRef.current?.snapToIndex(1);
    } else if (tripSummary) {
      setDriveState('summary');
      setShowSummaryModal(true);
    } else {
      setDriveState('idle');
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [activeTrip, tripSummary]);

  useEffect(() => {
    if (driveState === 'active') {
      // snap to expanded position when entering fare mode
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [isFareEntryMode, driveState]);

  const pausedDurationRef = useRef(0);
  const lastPauseTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (activeTrip) {
      const startTime = new Date(activeTrip.started_at).getTime();

      if (activeTrip.status === 'paused') {
        if (lastPauseTimeRef.current === null) {
          lastPauseTimeRef.current = Date.now();
        }
        return;
      } else {
        if (lastPauseTimeRef.current !== null) {
          pausedDurationRef.current += Date.now() - lastPauseTimeRef.current;
          lastPauseTimeRef.current = null;
        }
      }

      const updateDuration = () => {
        const now = Date.now();
        const totalElapsed = now - startTime - pausedDurationRef.current;
        setTripDuration(Math.floor(totalElapsed / 1000));
      };

      updateDuration();
      interval = setInterval(updateDuration, 1000);
    } else {
      pausedDurationRef.current = 0;
      lastPauseTimeRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTrip, activeTrip?.status]);

  const hasInitializedMap = useRef(false);
  useEffect(() => {
    if (currentLocation && mapRef.current && !hasInitializedMap.current) {
      hasInitializedMap.current = true;
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  const snapPoints = useMemo(() => {
    const tabBarHeight = Platform.OS === 'ios' ? 88 : 64;
    if (driveState === 'active') {
      if (isFareEntryMode) {
        // expanded mode when adding passenger fare - need more space for full UI
        return [
          Math.round(height * 0.55) + tabBarHeight,
          Math.round(height * 0.65) + tabBarHeight,
        ];
      }
      // compact mode when showing summary with pause/end buttons
      return [
        Math.round(height * 0.38) + tabBarHeight,
        Math.round(height * 0.50) + tabBarHeight,
      ];
    }
    if (driveState === 'selecting-route') {
      return [
        Math.round(height * 0.30) + tabBarHeight,
        Math.round(height * 0.70) + tabBarHeight,
      ];
    }
    return [Math.round(height * 0.28) + tabBarHeight];
  }, [driveState, isFareEntryMode]);

  const mapPadding = useMemo(() => {
    const sheetHeight = snapPoints[0] ?? 200;
    return {
      top: insets.top + 60,
      right: 0,
      bottom: sheetHeight,
      left: 0,
    };
  }, [snapPoints, insets.top]);

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

    let locationToUse = currentLocation;

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
          accuracy: loc.coords.accuracy ?? 0,
          timestamp: loc.timestamp,
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
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const filteredOtherDrivers = useMemo(() => {
    if (!activeTrip) return otherDrivers;
    return otherDrivers.filter((t) => t.driver_id !== user?.id);
  }, [otherDrivers, activeTrip, user?.id]);

  const currentRoute = useMemo(() => {
    if (activeTrip) {
      return routes.find((r) => r.id === activeTrip.route_id);
    }
    return selectedRoute;
  }, [activeTrip, routes, selectedRoute]);

  const renderSheetContent = () => {
    if (driveState === 'active') {
      return (
        <ActiveTripControls
          activeTrip={activeTrip}
          tripDuration={tripDuration}
          routeName={currentRoute?.name}
          routeColor={currentRoute?.color}
          totalFare={totalFare}
          regularPassengers={regularPassengers}
          discountedPassengers={discountedPassengers}
          currentPassengersOnboard={currentPassengersOnboard}
          fareEntries={fareEntries}
          isEndingTrip={isEndingTrip}
          onAddFare={logCustomFare}
          onUndoLastFare={undoLastFare}
          onDecrementPassenger={decrementPassenger}
          onTogglePause={handleTogglePause}
          onEndTrip={handleEndTrip}
          onFareEntryModeChange={setIsFareEntryMode}
        />
      );
    }

    if (driveState === 'selecting-route') {
      return (
        <RouteSelection
          routes={routes}
          isLoading={routesLoading}
          pendingRoute={pendingRoute}
          isGettingLocation={isGettingLocation}
          onSelectRoute={handleSelectRoute}
          onCancel={() => setDriveState('idle')}
        />
      );
    }

    return (
      <IdleState
        onGoOnline={handleGoOnline}
        isPressed={isGoOnlinePressed}
        onPressIn={() => setIsGoOnlinePressed(true)}
        onPressOut={() => setIsGoOnlinePressed(false)}
        hasVehicle={!!vehicle}
        isVehicleLoading={vehicleLoading}
      />
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        googleRenderer={Platform.OS === 'android' ? 'LEGACY' : undefined}
        initialRegion={currentLocation ? { ...currentLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 } : MANILA_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        mapPadding={mapPadding}
      >
        {currentLocation && (
          <DriverSelfMarker
            coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
            gpsHeading={currentLocation.heading || 0}
            gpsSpeed={currentLocation.speed || 0}
            routeColor={currentRoute?.color || theme.colors.primary}
          />
        )}

        {filteredOtherDrivers.map((driver) => {
          const stale = driver.last_updated ? isLocationStale(driver.last_updated) : false;
          return (
            <JeepneyMarker
              key={driver.id}
              trip={driver}
              isStale={stale}
              onPress={() => {}}
            />
          );
        })}
      </MapView>

      <EarningsBadge amount={totalFare} />

      <Pressable
        onPress={handleCenterOnUser}
        style={[styles.centerButton, { backgroundColor: theme.colors.surface, top: insets.top + 12 }]}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={theme.colors.primary} />
      </Pressable>

      {!isOnline && (
        <View style={[styles.offlineBanner, { top: insets.top + 60, backgroundColor: theme.colors.errorContainer }]}>
          <MaterialCommunityIcons name="wifi-off" size={16} color={theme.colors.error} />
          <Text style={[styles.offlineText, { color: theme.colors.onErrorContainer }]}>Offline</Text>
        </View>
      )}

      <CustomBottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        initialIndex={driveState === 'idle' ? 0 : 1}
        backgroundColor={theme.colors.surface}
        handleColor={theme.colors.outlineVariant}
        showHandle={driveState !== 'idle'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.sheetContent,
            driveState === 'active' && styles.activeSheetContent,
            { paddingBottom: insets.bottom + 24 }
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={driveState === 'selecting-route'}
        >
          {renderSheetContent()}
        </ScrollView>
      </CustomBottomSheet>

      <TripSummaryModal
        visible={showSummaryModal}
        tripSummary={tripSummary}
        onDismiss={handleNewTrip}
        onNewTrip={handleNewTrip}
      />

      <LoadingOverlay visible={isStartingTrip} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  activeSheetContent: {
    paddingTop: 12,
  },
});
