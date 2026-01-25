import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EarningsBreakdownProps {
  totalPassengers: number;
  totalEarnings: number;
}

export function EarningsBreakdown({ totalPassengers, totalEarnings }: EarningsBreakdownProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.icon, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="account-group" size={18} color="#4CAF50" />
          </View>
          <View>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Passenger Fares
            </Text>
            <Text style={[styles.subtext, { color: theme.colors.onSurfaceVariant }]}>
              {totalPassengers} passengers × ₱13 avg
            </Text>
          </View>
        </View>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>
          ₱{totalEarnings.toLocaleString()}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.icon, { backgroundColor: '#FFF3E0' }]}>
            <MaterialCommunityIcons name="percent" size={18} color="#F57C00" />
          </View>
          <View>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Service Fee
            </Text>
            <Text style={[styles.subtext, { color: theme.colors.onSurfaceVariant }]}>
              Platform commission (0%)
            </Text>
          </View>
        </View>
        <Text style={[styles.value, { color: '#4CAF50' }]}>₱0</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.icon, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="wallet" size={18} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.label, { color: theme.colors.onSurface, fontWeight: '700' }]}>
              Net Earnings
            </Text>
            <Text style={[styles.subtext, { color: theme.colors.onSurfaceVariant }]}>
              Your take-home amount
            </Text>
          </View>
        </View>
        <Text style={[styles.value, { color: theme.colors.primary, fontWeight: '700' }]}>
          ₱{totalEarnings.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtext: {
    fontSize: 12,
    marginTop: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
});
