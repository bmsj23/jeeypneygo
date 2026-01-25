import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Vehicle } from '@jeepneygo/core';

interface VehicleHeroCardProps {
  vehicle: Vehicle;
}

export function VehicleHeroCard({ vehicle }: VehicleHeroCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.vehicleIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="bus" size={40} color={theme.colors.primary} />
      </View>
      <Text style={[styles.plateNumber, { color: theme.colors.onSurface }]}>
        {vehicle.plate_number}
      </Text>
      <View style={[styles.statusBadge, { backgroundColor: vehicle.is_active ? '#E8F5E9' : '#FFEBEE' }]}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: vehicle.is_active ? '#4CAF50' : '#F44336' },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: vehicle.is_active ? '#4CAF50' : '#F44336' },
          ]}
        >
          {vehicle.is_active ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  vehicleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  plateNumber: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});