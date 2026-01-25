import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TripTimer, FareLoggerCompact } from '@jeepneygo/ui';
import type { ActiveTrip, FareEntry } from '@jeepneygo/core';

interface ActiveTripControlsProps {
  activeTrip: ActiveTrip | null;
  tripDuration: number;
  routeName?: string;
  routeColor?: string;
  totalFare: number;
  regularPassengers: number;
  discountedPassengers: number;
  fareEntries: FareEntry[];
  isEndingTrip: boolean;
  onLogFare: (type: 'regular' | 'discounted') => void;
  onUndoLastFare: () => void;
  onTogglePause: () => void;
  onEndTrip: () => void;
}

export function ActiveTripControls({
  activeTrip,
  tripDuration,
  routeName,
  routeColor,
  totalFare,
  regularPassengers,
  discountedPassengers,
  fareEntries,
  isEndingTrip,
  onLogFare,
  onUndoLastFare,
  onTogglePause,
  onEndTrip,
}: ActiveTripControlsProps) {
  const theme = useTheme();
  const isPaused = activeTrip?.status === 'paused';

  return (
    <View>
      <TripTimer
        seconds={tripDuration}
        status={isPaused ? 'paused' : 'active'}
        routeName={routeName}
        routeColor={routeColor}
      />

      <View style={styles.fareSection}>
        <FareLoggerCompact
          onLogFare={onLogFare}
          totalFare={totalFare}
          regularCount={regularPassengers}
          discountedCount={discountedPassengers}
          disabled={isPaused}
        />
        {fareEntries.length > 0 && (
          <Pressable onPress={onUndoLastFare} style={styles.undoButton}>
            <MaterialCommunityIcons name="undo" size={16} color="#F59E0B" />
            <Text style={styles.undoText}>Undo last</Text>
          </Pressable>
        )}
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
    marginTop: 20,
    marginBottom: 20,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 6,
  },
  undoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F59E0B',
  },
  actions: {
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
  endButton: {
    flex: 1.5,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
