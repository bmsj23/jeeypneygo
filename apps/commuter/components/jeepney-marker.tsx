import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Marker } from 'react-native-maps';
import { JeepneySvg } from '@jeepneygo/ui';
import type { ActiveTripWithDetails } from '@jeepneygo/core';

interface JeepneyMarkerProps {
  trip: ActiveTripWithDetails;
  isStale?: boolean;
  onPress?: (trip: ActiveTripWithDetails) => void;
}

const MARKER_SIZE = 48;
const TRACKS_VIEW_CHANGES_TIMEOUT = 600;

function JeepneyMarkerComponent({ trip, isStale = false, onPress }: JeepneyMarkerProps) {
  const routeColor = trip.route?.color || '#FFB800';
  const heading = trip.heading || 0;

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const tracksTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const headingChanged = Math.abs((prevCoords.heading || 0) - newHeading) > 1;

    if (coordsChanged || headingChanged) {
      scheduleDisableTracking();
    }

    prevCoordsRef.current = {
      latitude: newLat,
      longitude: newLng,
      heading: newHeading,
    };
  }, [trip.current_latitude, trip.current_longitude, trip.heading, scheduleDisableTracking]);

  if (!trip.current_latitude || !trip.current_longitude) {
    return null;
  }

  const shouldTrackChanges = Platform.OS === 'ios' ? tracksViewChanges : false;

  return (
    <Marker
      coordinate={{
        latitude: trip.current_latitude,
        longitude: trip.current_longitude,
      }}
      rotation={heading}
      flat={true}
      onPress={() => onPress?.(trip)}
      tracksViewChanges={shouldTrackChanges}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={[styles.container, isStale && styles.stale]}>
        <View style={styles.markerWrapper}>
          <JeepneySvg size={MARKER_SIZE} color={routeColor} />
        </View>
        <View style={[styles.passengerBadge, { backgroundColor: routeColor }]}>
          <Text style={styles.passengerText}>{trip.passenger_count || 0}</Text>
        </View>
      </View>
    </Marker>
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

function arePropsEqual(prevProps: JeepneyMarkerProps, nextProps: JeepneyMarkerProps): boolean {
  if (prevProps.trip.id !== nextProps.trip.id) return false;

  if (prevProps.isStale !== nextProps.isStale) return false;

  const latDiff = Math.abs((prevProps.trip.current_latitude || 0) - (nextProps.trip.current_latitude || 0));
  const lngDiff = Math.abs((prevProps.trip.current_longitude || 0) - (nextProps.trip.current_longitude || 0));
  if (latDiff > 0.00001 || lngDiff > 0.00001) return false;

  const headingDiff = Math.abs((prevProps.trip.heading || 0) - (nextProps.trip.heading || 0));
  if (headingDiff > 2) return false;

  if (prevProps.trip.passenger_count !== nextProps.trip.passenger_count) return false;

  if (prevProps.trip.route?.color !== nextProps.trip.route?.color) return false;

  return true;
}

export const JeepneyMarker = memo(JeepneyMarkerComponent, arePropsEqual);
