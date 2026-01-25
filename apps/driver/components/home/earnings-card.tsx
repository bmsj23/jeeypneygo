import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EarningsCardProps {
  earningsToday: number;
  tripsToday: number;
  passengersToday: number;
}

export function EarningsCard({ earningsToday, tripsToday, passengersToday }: EarningsCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.earningsCard, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.earningsHeader}>
        <Text style={styles.earningsLabel}>Today's Earnings</Text>
        <MaterialCommunityIcons name="wallet" size={24} color="rgba(0,0,0,0.3)" />
      </View>
      <Text style={styles.earningsAmount}>₱{earningsToday.toFixed(2)}</Text>
      <View style={styles.earningsFooter}>
        <View style={styles.earningsFooterItem}>
          <MaterialCommunityIcons name="car" size={16} color="rgba(0,0,0,0.5)" />
          <Text style={styles.earningsFooterText}>{tripsToday} trips</Text>
        </View>
        <View style={styles.earningsFooterItem}>
          <MaterialCommunityIcons name="account-group" size={16} color="rgba(0,0,0,0.5)" />
          <Text style={styles.earningsFooterText}>{passengersToday} passengers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  earningsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
  },
  earningsAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  earningsFooter: {
    flexDirection: 'row',
    gap: 24,
  },
  earningsFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsFooterText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.5)',
  },
});
