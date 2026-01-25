import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TripTimer, FareEntryPanel } from '@jeepneygo/ui';
import type { ActiveTrip, FareEntry } from '@jeepneygo/core';

interface ActiveTripControlsProps {
  activeTrip: ActiveTrip | null;
  tripDuration: number;
  routeName?: string;
  routeColor?: string;
  totalFare: number;
  regularPassengers: number;
  discountedPassengers: number;
  currentPassengersOnboard: number;
  fareEntries: FareEntry[];
  isEndingTrip: boolean;
  onAddFare: (amount: number) => void;
  onUndoLastFare: () => void;
  onDecrementPassenger: () => void;
  onTogglePause: () => void;
  onEndTrip: () => void;
  onFareEntryModeChange?: (isEntering: boolean) => void;
}

export function ActiveTripControls({
  activeTrip,
  tripDuration,
  routeName,
  routeColor,
  totalFare,
  regularPassengers,
  discountedPassengers,
  currentPassengersOnboard,
  fareEntries,
  isEndingTrip,
  onAddFare,
  onUndoLastFare,
  onDecrementPassenger,
  onTogglePause,
  onEndTrip,
  onFareEntryModeChange,
}: ActiveTripControlsProps) {
  const theme = useTheme();
  const isPaused = activeTrip?.status === 'paused';
  // use currentPassengersOnboard for display (actual passengers in vehicle)
  // regularPassengers + discountedPassengers is total served (for stats)

  return (
    <View>
      <TripTimer
        seconds={tripDuration}
        status={isPaused ? 'paused' : 'active'}
        routeName={routeName}
        routeColor={routeColor}
      />

      <View style={styles.fareSection}>
        <FareEntryPanel
          totalFare={totalFare}
          passengerCount={currentPassengersOnboard}
          onAddFare={onAddFare}
          onUndo={onUndoLastFare}
          onDecrementPassenger={onDecrementPassenger}
          canUndo={fareEntries.length > 0}
          disabled={isPaused}
          onModeChange={onFareEntryModeChange}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onTogglePause}
          style={[
            styles.actionButton,
            { backgroundColor: isPaused ? '#4CAF50' : theme.colors.surfaceVariant },
          ]}
        >
          <MaterialCommunityIcons
            name={isPaused ? 'play' : 'pause'}
            size={24}
            color={isPaused ? '#FFFFFF' : theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: isPaused ? '#FFFFFF' : theme.colors.onSurfaceVariant },
            ]}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onEndTrip}
          disabled={isEndingTrip}
          style={[styles.actionButton, styles.endButton, { backgroundColor: theme.colors.error }]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  fareSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  endButton: {
    flex: 1.5,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
