import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { AnimatedRegion, MarkerAnimated } from 'react-native-maps';
import { JeepneySvg } from '@jeepneygo/ui';
import type { ActiveTripWithDetails } from '@jeepneygo/core';

interface JeepneyMarkerProps {
  trip: ActiveTripWithDetails;
  isStale?: boolean;
  onPress?: (trip: ActiveTripWithDetails) => void;
}

const ANIMATION_DURATION = 500;
const MARKER_SIZE = 48;
const TRACKS_VIEW_CHANGES_TIMEOUT = 600;

function JeepneyMarkerComponent({ trip, isStale = false, onPress }: JeepneyMarkerProps) {
  const routeColor = trip.route?.color || '#FFB800';
  const heading = trip.heading || 0;

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const tracksTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animatedCoordinate = useRef(
    new AnimatedRegion({
      latitude: trip.current_latitude || 0,
      longitude: trip.current_longitude || 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;

  const animatedHeading = useRef(new Animated.Value(heading)).current;

  const prevCoordsRef = useRef({
    latitude: trip.current_latitude,
    longitude: trip.current_longitude,
    heading: heading,
  });

  const scheduleDisableTracking = useCallback(() => {
    if (tracksTimeoutRef.current) {
      clearTimeout(tracksTimeoutRef.current);
    }
    setTracksViewChanges(true);
    tracksTimeoutRef.current = setTimeout(() => {
      setTracksViewChanges(false);
    }, TRACKS_VIEW_CHANGES_TIMEOUT);
  }, []);

  useEffect(() => {
    return () => {
      if (tracksTimeoutRef.current) {
        clearTimeout(tracksTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const prevCoords = prevCoordsRef.current;
    const newLat = trip.current_latitude || 0;
    const newLng = trip.current_longitude || 0;
    const newHeading = trip.heading || 0;

    const coordsChanged =
      prevCoords.latitude !== newLat || prevCoords.longitude !== newLng;
    const headingChanged = prevCoords.heading !== newHeading;

    if (coordsChanged) {
      scheduleDisableTracking();
      animatedCoordinate.timing({
        latitude: newLat,
        longitude: newLng,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      } as any).start();
    }

    if (headingChanged) {
      scheduleDisableTracking();

      let targetHeading = newHeading;
      let diff = targetHeading - prevCoords.heading;
      if (diff > 180) targetHeading = newHeading - 360;
      if (diff < -180) targetHeading = newHeading + 360;

      Animated.timing(animatedHeading, {
        toValue: targetHeading,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        animatedHeading.setValue(newHeading);
      });
    }

    prevCoordsRef.current = {
      latitude: newLat,
      longitude: newLng,
      heading: newHeading,
    };
  }, [trip.current_latitude, trip.current_longitude, trip.heading, animatedCoordinate, animatedHeading, scheduleDisableTracking]);

  if (!trip.current_latitude || !trip.current_longitude) {
    return null;
  }

  const rotation = animatedHeading.interpolate({
    inputRange: [-360, 0, 360, 720],
    outputRange: ['-360deg', '0deg', '360deg', '720deg'],
  });

  const shouldTrackChanges = Platform.OS === 'ios' && tracksViewChanges;

  return (
    <MarkerAnimated
      coordinate={animatedCoordinate}
      onPress={() => onPress?.(trip)}
      tracksViewChanges={shouldTrackChanges}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={[styles.container, isStale && styles.stale]}>
        <Animated.View
          style={[
            styles.markerWrapper,
            { transform: [{ rotate: rotation }] },
          ]}
        >
          <JeepneySvg size={MARKER_SIZE} color={routeColor} />
        </Animated.View>
        <View style={[styles.passengerBadge, { backgroundColor: routeColor }]}>
          <Text style={styles.passengerText}>{trip.passenger_count || 0}</Text>
        </View>
      </View>
    </MarkerAnimated>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  stale: {
    opacity: 0.4,
  },
  markerWrapper: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  passengerBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  passengerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

// custom comparison function for memo - only re-render on significant changes
function arePropsEqual(prevProps: JeepneyMarkerProps, nextProps: JeepneyMarkerProps): boolean {
  // always re-render if trip id changes
  if (prevProps.trip.id !== nextProps.trip.id) return false;

  // re-render if stale status changes
  if (prevProps.isStale !== nextProps.isStale) return false;

  // re-render if position changes (with small threshold for noise)
  const latDiff = Math.abs((prevProps.trip.current_latitude || 0) - (nextProps.trip.current_latitude || 0));
  const lngDiff = Math.abs((prevProps.trip.current_longitude || 0) - (nextProps.trip.current_longitude || 0));
  if (latDiff > 0.00001 || lngDiff > 0.00001) return false;

  // re-render if heading changes by more than 2 degrees
  const headingDiff = Math.abs((prevProps.trip.heading || 0) - (nextProps.trip.heading || 0));
  if (headingDiff > 2) return false;

  // re-render if passenger count changes
  if (prevProps.trip.passenger_count !== nextProps.trip.passenger_count) return false;

  // re-render if route color changes
  if (prevProps.trip.route?.color !== nextProps.trip.route?.color) return false;

  return true;
}

export const JeepneyMarker = memo(JeepneyMarkerComponent, arePropsEqual);
