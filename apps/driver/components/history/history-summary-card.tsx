import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface HistorySummaryStats {
  totalTrips: number;
  totalPassengers: number;
  totalHours: number;
  totalEarnings: number;
}

interface HistorySummaryCardProps {
  stats: HistorySummaryStats;
}

export function HistorySummaryCard({ stats }: HistorySummaryCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            {stats.totalTrips}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Trips</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outline }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            {stats.totalPassengers}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
            Passengers
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outline }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            {stats.totalHours}h
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Hours</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outline }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
            ₱{stats.totalEarnings.toLocaleString()}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
            Earnings
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    opacity: 0.3,
  },
});
