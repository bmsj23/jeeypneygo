import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, useTheme, IconButton, Portal, Modal, ActivityIndicator, Switch } from 'react-native-paper';
import { Button, ScreenContainer, Card } from '@jeepneygo/ui';
import {
  useAuthStore,
  useTripStore,
  useRoutes,
  useDriverVehicle,
  useLocationTracking,
  useNetworkStatus,
  type Route,
  type TripSummary,
} from '@jeepneygo/core';

type ScreenState = 'route-select' | 'active-trip' | 'trip-summary';

export default function TripScreen() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  
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
  const { isOnline, status: networkStatus } = useNetworkStatus();
  
  // local state
  const [screenState, setScreenState] = useState<ScreenState>('route-select');
  const [tripSummary, setTripSummary] = useState<TripSummary | null>(null);
  const [tripDuration, setTripDuration] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showDebug, setShowDebug] = useState(true);

  // location tracking - enabled on route selection screen OR during active trip
  const shouldTrackLocation = screenState === 'route-select' || (activeTrip !== null && activeTrip.status === 'active');
  
  const { currentLocation, hasPermission, requestPermission, isTracking } = useLocationTracking({
    enabled: shouldTrackLocation,
    intervalMs: 10000,
    onLocationUpdate: useCallback((location: { latitude: number; longitude: number; heading: number; speed: number }) => {
      if (activeTrip) {
        updateLocation(location.latitude, location.longitude, location.heading, location.speed);
      }
    }, [activeTrip, updateLocation]),
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

  // determine screen state based on active trip
  useEffect(() => {
    if (activeTrip) {
      setScreenState('active-trip');
    } else if (tripSummary) {
      setScreenState('trip-summary');
    } else {
      setScreenState('route-select');
    }
  }, [activeTrip, tripSummary]);

  // trip duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
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

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectRoute = async (route: Route) => {
    // check for location permission first
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Location Required',
          'Location permission is required to start a trip. Please enable it in settings.',
          [{ text: 'OK' }]
        );
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

    // if location not available yet, try to get it
    let locationToUse = currentLocation;
    if (!locationToUse) {
      setIsGettingLocation(true);
      try {
        const Location = await import('expo-location');
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        locationToUse = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          heading: loc.coords.heading ?? 0,
          speed: loc.coords.speed ?? 0,
        };
      } catch (err) {
        Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
        setIsGettingLocation(false);
        return;
      }
      setIsGettingLocation(false);
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
    }
  };

  const handlePassengerChange = (delta: number) => {
    if (!activeTrip) return;
    const newCount = activeTrip.passenger_count + delta;
    updatePassengerCount(newCount);
  };

  const handleEndTrip = () => {
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
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
      ]
    );
  };

  const handleNewTrip = () => {
    setTripSummary(null);
    setSelectedRoute(null);
    setScreenState('route-select');
  };

  const handleTogglePause = async () => {
    if (!activeTrip) return;
    
    if (activeTrip.status === 'paused') {
      await resumeTrip();
    } else {
      await pauseTrip();
    }
  };

  // route selection screen
  const renderRouteSelection = () => (
    <>
      {/* connection status banner */}
      {!isOnline && (
        <View style={[styles.connectionBanner, { backgroundColor: theme.colors.errorContainer }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
            No internet connection
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Start a Trip
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select your route to begin
        </Text>
        
        {/* status indicators */}
        <View style={styles.statusRow}>
          {/* gps status */}
          {currentLocation ? (
            <View style={styles.locationStatus}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                GPS Ready
              </Text>
            </View>
          ) : hasPermission ? (
            <View style={styles.locationStatus}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                Getting location...
              </Text>
            </View>
          ) : null}
          
          {/* connection status */}
          <View style={styles.locationStatus}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* debug panel */}
      {showDebug && (
        <Card style={styles.debugCard}>
          <Card.Content>
            <View style={styles.debugHeader}>
              <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                Debug Info
              </Text>
              <Switch value={showDebug} onValueChange={setShowDebug} />
            </View>
            <View style={styles.debugRow}>
              <Text variant="bodySmall" style={styles.debugLabel}>GPS Tracking:</Text>
              <Text variant="bodySmall" style={styles.debugValue}>{isTracking ? 'Active' : 'Inactive'}</Text>
            </View>
            <View style={styles.debugRow}>
              <Text variant="bodySmall" style={styles.debugLabel}>Permission:</Text>
              <Text variant="bodySmall" style={styles.debugValue}>{hasPermission ? 'Granted' : 'Denied'}</Text>
            </View>
            <View style={styles.debugRow}>
              <Text variant="bodySmall" style={styles.debugLabel}>Latitude:</Text>
              <Text variant="bodySmall" style={styles.debugValue}>{currentLocation?.latitude?.toFixed(6) ?? 'N/A'}</Text>
            </View>
            <View style={styles.debugRow}>
              <Text variant="bodySmall" style={styles.debugLabel}>Longitude:</Text>
              <Text variant="bodySmall" style={styles.debugValue}>{currentLocation?.longitude?.toFixed(6) ?? 'N/A'}</Text>
            </View>
            <View style={styles.debugRow}>
              <Text variant="bodySmall" style={styles.debugLabel}>Accuracy:</Text>
              <Text variant="bodySmall" style={styles.debugValue}>{currentLocation?.accuracy?.toFixed(1) ?? 'N/A'} m</Text>
            </View>
            <View style={styles.debugRow}>
              <Text variant="bodySmall" style={styles.debugLabel}>Speed:</Text>
              <Text variant="bodySmall" style={styles.debugValue}>{currentLocation?.speed?.toFixed(1) ?? 'N/A'} m/s</Text>
            </View>
            <View style={styles.debugRow}>
              <Text variant="bodySmall" style={styles.debugLabel}>Heading:</Text>
              <Text variant="bodySmall" style={styles.debugValue}>{currentLocation?.heading?.toFixed(0) ?? 'N/A'}°</Text>
            </View>
            <View style={styles.debugRow}>
              <Text variant="bodySmall" style={styles.debugLabel}>Network:</Text>
              <Text variant="bodySmall" style={styles.debugValue}>{networkStatus.type} ({isOnline ? 'Online' : 'Offline'})</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {!showDebug && (
        <View style={styles.debugToggle}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Show Debug</Text>
          <Switch value={showDebug} onValueChange={setShowDebug} />
        </View>
      )}

      {!vehicle && !vehicleLoading && (
        <Card style={{ ...styles.warningCard, backgroundColor: theme.colors.errorContainer }}>
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>
              No vehicle assigned to your account. Please contact admin.
            </Text>
          </Card.Content>
        </Card>
      )}

      {isGettingLocation && (
        <Portal>
          <Modal visible={true} dismissable={false} contentContainerStyle={styles.locationModal}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 16 }}>
              Getting your location...
            </Text>
          </Modal>
        </Portal>
      )}

      {routesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Loading routes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              style={styles.routeCard}
              onPress={() => handleSelectRoute(item as Route)}
            >
              <Card.Content style={styles.routeCardContent}>
                <View style={[styles.routeColor, { backgroundColor: item.color }]} />
                <View style={styles.routeInfo}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.short_name}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    {item.operating_start?.slice(0, 5)} - {item.operating_end?.slice(0, 5)} • ₱{item.base_fare} base fare
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                No routes available
              </Text>
            </View>
          }
          contentContainerStyle={styles.routeList}
        />
      )}

      {isStartingTrip && (
        <Portal>
          <Modal visible={true} dismissable={false}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ marginTop: 16 }}>
                Starting trip...
              </Text>
            </View>
          </Modal>
        </Portal>
      )}
    </>
  );

  // active trip dashboard
  const renderActiveTrip = () => (
    <>
      <View style={styles.header}>
        <View style={styles.tripHeader}>
          <View>
            <Text variant="headlineSmall" style={styles.title}>
              Active Trip
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {selectedRoute?.name || 'Unknown Route'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { 
            backgroundColor: activeTrip?.status === 'paused' 
              ? theme.colors.errorContainer 
              : '#E8F5E9' 
          }]}>
            <Text variant="labelSmall" style={{ 
              color: activeTrip?.status === 'paused' 
                ? theme.colors.onErrorContainer 
                : '#4CAF50' 
            }}>
              {activeTrip?.status === 'paused' ? 'PAUSED' : 'ACTIVE'}
            </Text>
          </View>
        </View>
      </View>

      <Card style={styles.timerCard}>
        <Card.Content style={styles.timerContent}>
          <Text variant="displayMedium" style={[styles.timerText, { color: theme.colors.primary }]}>
            {formatDuration(tripDuration)}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Trip Duration
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.passengerCard}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
            Passenger Count
          </Text>
          <View style={styles.passengerControls}>
            <IconButton
              icon="minus"
              mode="contained"
              size={32}
              onPress={() => handlePassengerChange(-1)}
              disabled={!activeTrip || activeTrip.passenger_count <= 0}
              style={styles.passengerButton}
            />
            <View style={styles.passengerCount}>
              <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                {activeTrip?.passenger_count || 0}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                / {vehicle?.capacity || 20} seats
              </Text>
            </View>
            <IconButton
              icon="plus"
              mode="contained"
              size={32}
              onPress={() => handlePassengerChange(1)}
              disabled={!activeTrip || activeTrip.passenger_count >= (vehicle?.capacity || 20)}
              style={styles.passengerButton}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.locationCard}>
        <Card.Content>
          <Text variant="titleSmall" style={{ marginBottom: 8 }}>
            Location Status
          </Text>
          <View style={styles.locationInfo}>
            <View style={[styles.locationDot, { 
              backgroundColor: isTracking ? '#4CAF50' : theme.colors.error 
            }]} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {isTracking ? 'GPS Active - Updating every 10s' : 'GPS Inactive'}
            </Text>
          </View>
          {currentLocation && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.tripActions}>
        <Button
          mode="outlined"
          onPress={handleTogglePause}
          icon={activeTrip?.status === 'paused' ? 'play' : 'pause'}
          style={styles.pauseButton}
        >
          {activeTrip?.status === 'paused' ? 'Resume' : 'Pause'}
        </Button>
        <Button
          mode="contained"
          onPress={handleEndTrip}
          icon="stop"
          style={[styles.endButton, { backgroundColor: theme.colors.error }]}
          loading={isEndingTrip}
        >
          End Trip
        </Button>
      </View>
    </>
  );

  // trip summary screen
  const renderTripSummary = () => (
    <>
      <View style={styles.summaryHeader}>
        <Text variant="headlineSmall" style={styles.title}>
          Trip Complete
        </Text>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 24 }}>
            {tripSummary?.routeName}
          </Text>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                {formatDuration(tripSummary?.duration || 0)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Duration
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                {tripSummary?.totalPassengers || 0}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Passengers
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.summaryActions}>
        <Button mode="contained" size="large" fullWidth onPress={handleNewTrip} icon="play">
          Start New Trip
        </Button>
      </View>
    </>
  );

  return (
    <ScreenContainer scrollable={screenState !== 'route-select'}>
      {screenState === 'route-select' && renderRouteSelection()}
      {screenState === 'active-trip' && renderActiveTrip()}
      {screenState === 'trip-summary' && renderTripSummary()}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: 'bold',
    color: '#1A237E',
  },
  subtitle: {
    color: '#757575',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  warningCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeList: {
    paddingBottom: 16,
  },
  routeCard: {
    marginBottom: 12,
  },
  routeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeColor: {
    width: 8,
    height: 60,
    borderRadius: 4,
    marginRight: 16,
  },
  routeInfo: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 32,
    margin: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  timerCard: {
    marginBottom: 16,
  },
  timerContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timerText: {
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  passengerCard: {
    marginBottom: 16,
  },
  passengerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerButton: {
    margin: 8,
  },
  passengerCount: {
    alignItems: 'center',
    minWidth: 100,
  },
  locationCard: {
    marginBottom: 24,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
  },
  endButton: {
    flex: 1,
  },
  summaryHeader: {
    marginTop: 48,
    marginBottom: 32,
    alignItems: 'center',
  },
  summaryCard: {
    marginBottom: 32,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  summaryStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  summaryActions: {
    marginTop: 'auto',
    paddingBottom: 16,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  locationModal: {
    backgroundColor: 'white',
    padding: 32,
    margin: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  connectionBanner: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  debugCard: {
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  debugLabel: {
    color: '#757575',
  },
  debugValue: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  debugToggle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
});
