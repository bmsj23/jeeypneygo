import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme, FAB, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, Region, Marker } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import {
  useAuthStore,
  useTripStore,
  useActiveTrips,
  useRoutes,
  useDriverSpacing,
  useUserLocation,
  isLocationStale,
  type ActiveTripWithDetails,
} from '@jeepneygo/core';
import { ScreenContainer } from '@jeepneygo/ui';
import { SpacingHUD } from '../../components/spacing-hud';
import { JeepneyMarker } from '../../../commuter/components/jeepney-marker';
import { RouteSpacingOverlay } from '../../../commuter/components/route-spacing-overlay';

const { width, height } = Dimensions.get('window');

// lipa city default region
const LIPA_REGION: Region = {
  latitude: 13.9411,
  longitude: 121.1625,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function DriverMapScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const user = useAuthStore((state) => state.user);
  const { activeTrip, selectedRoute } = useTripStore();
  const { location: userLocation, refreshLocation } = useUserLocation();
  const { routes } = useRoutes();

  const [showConnectionError, setShowConnectionError] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [hadRealDisconnection, setHadRealDisconnection] = useState(false);
  const [lastConnectionState, setLastConnectionState] = useState<string>('connecting');
  const [showSpacingAlert, setShowSpacingAlert] = useState(false);
  const [spacingAlertMessage, setSpacingAlertMessage] = useState('');

  // get all trips on the same route (if active trip exists)
  const routeId = activeTrip?.route_id || selectedRoute?.id;
  const { trips: allTrips, connectionState } = useActiveTrips({
    routeId: routeId || undefined,
  });

  // filter out duplicate trips for current driver (keep only one trip per driver)
  const trips = useMemo(() => {
    const driverTripMap = new Map<string, typeof allTrips[0]>();
    allTrips.forEach((trip) => {
      const existingTrip = driverTripMap.get(trip.driver_id);
      // keep the most recent trip for each driver based on last_updated
      if (!existingTrip ||
          (trip.last_updated && existingTrip.last_updated &&
           new Date(trip.last_updated) > new Date(existingTrip.last_updated))) {
        driverTripMap.set(trip.driver_id, trip);
      } else if (!existingTrip) {
        driverTripMap.set(trip.driver_id, trip);
      }
    });
    return Array.from(driverTripMap.values());
  }, [allTrips]);

  // get the route data for polyline
  const currentRoute = useMemo(() => {
    if (!routeId) return null;
    return routes.find((r) => r.id === routeId) || selectedRoute || null;
  }, [routeId, routes, selectedRoute]);

  // calculate driver spacing
  const { currentDriverSpacing, spacingMap, newAlerts, clearNewAlerts, routeStats } =
    useDriverSpacing(trips, routeId || '', currentRoute, {
      currentTripId: activeTrip?.id,
      enableAlerts: true,
    });

  // show connection error snackbar only for real disconnections
  useEffect(() => {
    if (connectionState === 'error' || connectionState === 'disconnected') {
      if (lastConnectionState === 'connected') {
        setShowConnectionError(true);
        setHadRealDisconnection(true);
      }
    } else if (connectionState === 'connected') {
      setShowConnectionError(false);
      if (hadRealDisconnection) {
        setShowReconnected(true);
        setHadRealDisconnection(false);
      }
    }
    setLastConnectionState(connectionState);
  }, [connectionState, hadRealDisconnection, lastConnectionState]);

  // handle new spacing alerts
  useEffect(() => {
    if (newAlerts.length > 0) {
      const criticalAlert = newAlerts.find((a) => a.severity === 'critical');
      const warningAlert = newAlerts.find((a) => a.severity === 'warning');

      if (criticalAlert) {
        setSpacingAlertMessage(criticalAlert.message);
        setShowSpacingAlert(true);
      } else if (warningAlert) {
        setSpacingAlertMessage(warningAlert.message);
        setShowSpacingAlert(true);
      }

      clearNewAlerts();
    }
  }, [newAlerts, clearNewAlerts]);

  // center map on user when location available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [userLocation]);

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

  // check if a trip belongs to current driver
  const isCurrentDriver = useCallback(
    (trip: ActiveTripWithDetails) => {
      return trip.driver_id === user?.id;
    },
    [user?.id]
  );

  // render marker with differentiation for current driver
  const renderMarker = useCallback(
    (trip: ActiveTripWithDetails) => {
      const isSelf = isCurrentDriver(trip);
      const stale = trip.last_updated ? isLocationStale(trip.last_updated) : false;

      if (isSelf) {
        // render current driver's marker differently
        return (
          <Marker
            key={trip.id}
            coordinate={{
              latitude: trip.current_latitude,
              longitude: trip.current_longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.selfMarkerContainer}>
              <View style={[styles.selfMarkerOuter, { borderColor: theme.colors.primary }]}>
                <View style={[styles.selfMarkerInner, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.selfMarkerText}>YOU</Text>
                </View>
              </View>
              <View style={[styles.selfMarkerPulse, { borderColor: theme.colors.primary }]} />
            </View>
          </Marker>
        );
      }

      // render other drivers using standard marker
      return (
        <JeepneyMarker
          key={trip.id}
          trip={trip}
          isStale={stale}
          onPress={() => {}}
        />
      );
    },
    [isCurrentDriver, theme.colors.primary]
  );

  // no active trip view
  if (!activeTrip && !selectedRoute) {
    return (
      <ScreenContainer>
        <View style={styles.noTripContainer}>
          <Text variant="headlineSmall" style={styles.noTripTitle}>
            No Active Trip
          </Text>
          <Text variant="bodyMedium" style={styles.noTripSubtitle}>
            Start a trip from the Trip tab to see the map with other drivers on your route
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.container}>
      {/* map */}
      <ClusteredMapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={LIPA_REGION}
        showsUserLocation={!activeTrip}
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
        clusterColor={currentRoute?.color || theme.colors.primary}
        clusterTextColor="#FFFFFF"
        radius={50}
        minPoints={3}
        maxZoom={16}
      >
        {/* route overlay */}
        {currentRoute && (
          <RouteSpacingOverlay
            route={currentRoute}
            trips={trips}
            showRoutePath={true}
            showSpacingZones={trips.length > 1}
          />
        )}

        {/* driver markers */}
        {trips.map(renderMarker)}
      </ClusteredMapView>

      {/* spacing hud overlay */}
      {activeTrip && (
        <View style={[styles.spacingHudContainer, { top: insets.top + 16 }]}>
          <SpacingHUD
            spacing={currentDriverSpacing}
            isLoading={connectionState === 'connecting'}
          />
        </View>
      )}

      {/* route stats badge */}
      {routeStats && routeStats.activeDriverCount > 0 && (
        <View style={[styles.statsBadge, { top: insets.top + 16, right: 16 }]}>
          <Text style={styles.statsBadgeText}>
            {routeStats.activeDriverCount} driver{routeStats.activeDriverCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* center on user fab */}
      <FAB
        icon="crosshairs-gps"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={handleCenterOnUser}
        size="small"
        color={theme.colors.onPrimary}
      />

      {/* connection error snackbar */}
      <Snackbar
        visible={showConnectionError}
        onDismiss={() => setShowConnectionError(false)}
        duration={Snackbar.DURATION_MEDIUM}
        style={{ backgroundColor: theme.colors.errorContainer }}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>
          Connection lost. Reconnecting...
        </Text>
      </Snackbar>

      {/* reconnected snackbar */}
      <Snackbar
        visible={showReconnected}
        onDismiss={() => setShowReconnected(false)}
        duration={3000}
        style={{ backgroundColor: '#4CAF50' }}
      >
        <Text style={{ color: '#FFFFFF' }}>Connected! Live updates restored.</Text>
      </Snackbar>

      {/* spacing alert snackbar */}
      <Snackbar
        visible={showSpacingAlert}
        onDismiss={() => setShowSpacingAlert(false)}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setShowSpacingAlert(false),
        }}
        style={{ backgroundColor: theme.colors.errorContainer }}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>{spacingAlertMessage}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  noTripContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noTripTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  noTripSubtitle: {
    textAlign: 'center',
    color: '#757575',
  },
  spacingHudContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  statsBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
  selfMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfMarkerOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selfMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfMarkerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selfMarkerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.3,
  },
});
