import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EarningsHeroProps {
  totalEarnings: number;
  totalTrips: number;
  totalPassengers: number;
}

export function EarningsHero({ totalEarnings, totalTrips, totalPassengers }: EarningsHeroProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.label}>Total Earnings</Text>
      <Text style={styles.amount}>₱{totalEarnings.toLocaleString()}</Text>
      <View style={styles.subStats}>
        <View style={styles.subStat}>
          <MaterialCommunityIcons name="steering" size={16} color="rgba(0,0,0,0.5)" />
          <Text style={styles.subStatText}>{totalTrips} trips</Text>
        </View>
        <View style={styles.subStat}>
          <MaterialCommunityIcons name="account-group" size={16} color="rgba(0,0,0,0.5)" />
          <Text style={styles.subStatText}>{totalPassengers} passengers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 8,
  },
  amount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  subStats: {
    flexDirection: 'row',
    gap: 24,
  },
  subStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subStatText: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
  },
});
