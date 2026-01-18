import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Marker } from 'react-native-maps';
import type { ActiveTripWithDetails } from '@jeepneygo/core';

interface JeepneyMarkerProps {
  trip: ActiveTripWithDetails;
  isStale?: boolean;
  onPress?: (trip: ActiveTripWithDetails) => void;
}

function JeepneyMarkerComponent({ trip, isStale = false, onPress }: JeepneyMarkerProps) {
  const routeColor = trip.route?.color || '#FFB800';
  const heading = trip.heading || 0;

  if (!trip.current_latitude || !trip.current_longitude) {
    return null;
  }

  return (
    <Marker
      coordinate={{
        latitude: trip.current_latitude,
        longitude: trip.current_longitude,
      }}
      onPress={() => onPress?.(trip)}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={[styles.container, isStale && styles.stale]}>
        {/* direction indicator */}
        <View
          style={[
            styles.directionArrow,
            {
              borderBottomColor: routeColor,
              transform: [{ rotate: `${heading - 90}deg` }],
            },
          ]}
        />
        {/* jeepney icon */}
        <View style={[styles.markerBody, { backgroundColor: routeColor }]}>
          <Text style={styles.markerIcon}>🚐</Text>
        </View>
        {/* passenger count badge */}
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
