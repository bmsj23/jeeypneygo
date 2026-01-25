import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { JeepneyETACard } from '@jeepneygo/ui';
import { isLocationStale, type ActiveTripWithDetails, type Route } from '@jeepneygo/core';

interface SelectedTripContentProps {
  trip: ActiveTripWithDetails;
  route: Route | undefined;
  onViewRoute: () => void;
  onClose: () => void;
}

export function SelectedTripContent({
  trip,
  route,
  onViewRoute,
  onClose,
}: SelectedTripContentProps) {
  const theme = useTheme();

  return (
    <View style={styles.selectedTripCard}>
      <JeepneyETACard
        plateNumber={trip.vehicle?.plate_number || 'Unknown'}
        driverName={trip.driver?.display_name || undefined}
        routeName={route?.name || 'Unknown Route'}
        routeColor={route?.color || '#FFB800'}
        etaMinutes={Math.floor(Math.random() * 10) + 1}
        availableSeats={trip.vehicle?.capacity ? trip.vehicle.capacity - trip.passenger_count : 15}
        maxSeats={trip.vehicle?.capacity || 20}
        distance={`${(Math.random() * 2 + 0.1).toFixed(1)} km`}
        isStale={trip.last_updated ? isLocationStale(trip.last_updated) : false}
      />

      <View style={styles.tripActions}>
        <Pressable
          onPress={onViewRoute}
          style={[styles.tripActionButton, { backgroundColor: theme.colors.primaryContainer }]}
        >
          <MaterialCommunityIcons name="map-marker-path" size={20} color={theme.colors.primary} />
          <Text style={[styles.tripActionText, { color: theme.colors.primary }]}>View Route</Text>
        </Pressable>

        <Pressable
          onPress={onClose}
          style={[styles.tripActionButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons name="close" size={20} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.tripActionText, { color: theme.colors.onSurfaceVariant }]}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
