import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TripData {
  id: string;
  started_at: string;
  ended_at: string;
  total_passengers?: number | null;
  route?: {
    name?: string;
    color?: string;
  } | null;
}

interface TripCardProps {
  trip: TripData;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string, endedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const seconds = Math.floor((end - start) / 1000);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

export function TripCard({ trip }: TripCardProps) {
  const theme = useTheme();
  const routeColor = trip.route?.color || '#FFB800';
  const passengers = trip.total_passengers || 0;

  return (
    <View style={[styles.tripCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.routeColorBar, { backgroundColor: routeColor }]} />
      <View style={styles.tripContent}>
        <View style={styles.tripHeader}>
          <View style={styles.tripRouteInfo}>
            <Text style={[styles.routeName, { color: theme.colors.onSurface }]}>
              {trip.route?.name || 'Unknown Route'}
            </Text>
            <Text style={[styles.tripDate, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(trip.ended_at)} • {formatTime(trip.started_at)}
            </Text>
          </View>
          <View style={[styles.earningsBadge, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.earningsText}>₱{passengers * 13}</Text>
          </View>
        </View>

        <View style={styles.tripStats}>
          <View style={styles.tripStat}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.tripStatText, { color: theme.colors.onSurfaceVariant }]}>
              {formatDuration(trip.started_at, trip.ended_at)}
            </Text>
          </View>
          <View style={styles.tripStat}>
            <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.tripStatText, { color: theme.colors.onSurfaceVariant }]}>
              {passengers} passengers
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tripCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  routeColorBar: {
    width: 4,
  },
  tripContent: {
    flex: 1,
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripRouteInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
  },
  earningsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  earningsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tripStats: {
    flexDirection: 'row',
    gap: 16,
  },
  tripStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripStatText: {
    fontSize: 12,
  },
});
