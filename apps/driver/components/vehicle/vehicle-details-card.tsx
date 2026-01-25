import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Vehicle } from '@jeepneygo/core';

interface VehicleDetailsCardProps {
  vehicle: Vehicle;
}

export function VehicleDetailsCard({ vehicle }: VehicleDetailsCardProps) {
  const theme = useTheme();

  const renderInfoRow = (
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'],
    label: string,
    value: string,
    iconColor: string
  ) => (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Vehicle Details
      </Text>
      <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
        {renderInfoRow('car-side', 'Plate Number', vehicle.plate_number, '#1976D2')}
        <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
        {renderInfoRow('seat-passenger', 'Capacity', `${vehicle.capacity} passengers`, '#F57C00')}
        <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
        {renderInfoRow(
          'calendar',
          'Registered',
          new Date(vehicle.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          '#7B1FA2'
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  detailsCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
});