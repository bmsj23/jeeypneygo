import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TripTimerProps {
  seconds: number;
  status: 'active' | 'paused';
  routeName?: string;
  routeColor?: string;
}

export function TripTimer({ seconds, status, routeName, routeColor }: TripTimerProps) {
  const theme = useTheme();

  const formatDuration = (secs: number): string => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: status === 'active' ? '#4CAF50' : '#FF9800' }]} />
        <Text style={[styles.statusText, { color: status === 'active' ? '#4CAF50' : '#FF9800' }]}>
          {status === 'active' ? 'TRIP ACTIVE' : 'PAUSED'}
        </Text>
      </View>

      <Text style={[styles.timer, { color: theme.colors.onSurface }]}>{formatDuration(seconds)}</Text>

      {routeName && (
        <View style={styles.routeRow}>
          <View style={[styles.routeIndicator, { backgroundColor: routeColor || theme.colors.primary }]} />
          <Text style={[styles.routeName, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {routeName}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  routeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '500',
  },
});
