import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

interface SummaryStats {
  totalTrips: number;
  totalRoutes: number;
  totalFare: number;
}

interface HistorySummaryCardProps {
  stats: SummaryStats;
}

export function HistorySummaryCard({ stats }: HistorySummaryCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="bus" size={18} color="#1A237E" />
          </View>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            {stats.totalTrips}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
            Trips
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="routes" size={18} color="#4CAF50" />
          </View>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            {stats.totalRoutes}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
            Routes
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="wallet" size={18} color="#1976D2" />
          </View>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            ₱{stats.totalFare}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
            Total Fare
          </Text>
        </View>
      </View>
    </View>
  );
}

interface DateFilterChipsProps {
  selected: DateFilter;
  onSelect: (filter: DateFilter) => void;
}

export function DateFilterChips({ selected, onSelect }: DateFilterChipsProps) {
  const theme = useTheme();
  const filters: { key: DateFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
  ];

  return (
    <View style={styles.filterRow}>
      {filters.map((filter) => (
        <Pressable
          key={filter.key}
          onPress={() => onSelect(filter.key)}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                selected === filter.key ? theme.colors.primary : theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: selected === filter.key ? '#1A237E' : theme.colors.onSurfaceVariant,
                fontWeight: selected === filter.key ? '600' : '500',
              },
            ]}
          >
            {filter.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

interface TripHistoryItem {
  id: string;
  routeName: string;
  routeColor: string;
  startStop: string;
  endStop: string;
  fare: number;
  date: string;
}

interface TripCardProps {
  trip: TripHistoryItem;
}

export function TripCard({ trip }: TripCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.tripCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.routeBar, { backgroundColor: trip.routeColor }]} />
      <View style={styles.tripContent}>
        <View style={styles.tripHeader}>
          <Text style={[styles.routeName, { color: theme.colors.onSurface }]}>{trip.routeName}</Text>
          <Text style={[styles.tripFare, { color: theme.colors.primary }]}>₱{trip.fare}</Text>
        </View>
        <View style={styles.tripRoute}>
          <MaterialCommunityIcons name="circle-small" size={16} color={trip.routeColor} />
          <Text style={[styles.stopText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {trip.startStop}
          </Text>
        </View>
        <View style={styles.tripRoute}>
          <MaterialCommunityIcons name="map-marker" size={14} color={trip.routeColor} />
          <Text style={[styles.stopText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {trip.endStop}
          </Text>
        </View>
        <Text style={[styles.tripDate, { color: theme.colors.onSurfaceVariant }]}>{trip.date}</Text>
      </View>
    </View>
  );
}

export function getFilterLabel(filter: DateFilter): string {
  switch (filter) {
    case 'today':
      return "Today's Trips";
    case 'week':
      return "This Week's Trips";
    case 'month':
      return "This Month's Trips";
    default:
      return 'All Trips';
  }
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterText: {
    fontSize: 13,
  },
  tripCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  routeBar: {
    width: 4,
  },
  tripContent: {
    flex: 1,
    padding: 14,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  tripFare: {
    fontSize: 15,
    fontWeight: '700',
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  stopText: {
    fontSize: 13,
    flex: 1,
  },
  tripDate: {
    fontSize: 12,
    marginTop: 8,
  },
});
