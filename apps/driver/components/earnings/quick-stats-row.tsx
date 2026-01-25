import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface QuickStatsRowProps {
  avgPerTrip: number;
  avgPerPassenger: number;
}

export function QuickStatsRow({ avgPerTrip, avgPerPassenger }: QuickStatsRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.icon, { backgroundColor: '#E8F5E9' }]}>
          <MaterialCommunityIcons name="trending-up" size={20} color="#4CAF50" />
        </View>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>
          ₱{avgPerTrip.toFixed(0)}
        </Text>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          Avg per Trip
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.icon, { backgroundColor: '#E3F2FD' }]}>
          <MaterialCommunityIcons name="cash-multiple" size={20} color="#1976D2" />
        </View>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>
          ₱{avgPerPassenger.toFixed(0)}
        </Text>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          Avg per Passenger
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
