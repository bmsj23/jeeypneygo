import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Marker, AnimatedRegion, MarkerAnimated } from 'react-native-maps';
import type { ActiveTripWithDetails } from '@jeepneygo/core';

interface JeepneyMarkerProps {
  trip: ActiveTripWithDetails;
  isStale?: boolean;
  onPress?: (trip: ActiveTripWithDetails) => void;
}

const ANIMATION_DURATION = 500;

function JeepneyMarkerComponent({ trip, isStale = false, onPress }: JeepneyMarkerProps) {
  const routeColor = trip.route?.color || '#FFB800';
  const heading = trip.heading || 0;

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

  useEffect(() => {
    const prevCoords = prevCoordsRef.current;
    const newLat = trip.current_latitude || 0;
    const newLng = trip.current_longitude || 0;
    const newHeading = trip.heading || 0;

    const coordsChanged =
      prevCoords.latitude !== newLat || prevCoords.longitude !== newLng;
    const headingChanged = prevCoords.heading !== newHeading;

    if (coordsChanged) {
      animatedCoordinate.timing({
        latitude: newLat,
        longitude: newLng,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      } as any).start();
    }

    if (headingChanged) {
      Animated.timing(animatedHeading, {
        toValue: newHeading,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }

    prevCoordsRef.current = {
      latitude: newLat,
      longitude: newLng,
      heading: newHeading,
    };
  }, [trip.current_latitude, trip.current_longitude, trip.heading, animatedCoordinate, animatedHeading]);

  if (!trip.current_latitude || !trip.current_longitude) {
    return null;
  }

  const rotation = animatedHeading.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <MarkerAnimated
      coordinate={animatedCoordinate}
      onPress={() => onPress?.(trip)}
      tracksViewChanges={true}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={[styles.container, isStale && styles.stale]}>
        <Animated.View
          style={[
            styles.directionArrow,
            {
              borderBottomColor: routeColor,
              transform: [{ rotate: rotation }],
            },
          ]}
        />
        <View style={[styles.markerBody, { backgroundColor: routeColor }]}>
          <Text style={styles.markerIcon}>🚐</Text>
        </View>
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
    opacity: 1,
  },
  stale: {
    opacity: 0.4,
  },
  directionArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -2,
  },
  markerBody: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 18,
  },
  passengerBadge: {
    position: 'absolute',
    top: 6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  passengerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export const JeepneyMarker = memo(JeepneyMarkerComponent);
