import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatFare, type RouteWithStops } from '@jeepneygo/core';
import { FareEstimator } from '../../components/fare-estimator';

interface FareInfoCardProps {
  route: RouteWithStops;
  routeColor: string;
}

export function FareInfoCard({ route, routeColor }: FareInfoCardProps) {
  const theme = useTheme();

  return (
    <>
      <View style={[styles.fareCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.fareHeader}>
          <MaterialCommunityIcons name="cash" size={20} color={routeColor} />
          <Text style={[styles.fareTitle, { color: theme.colors.onSurface }]}>Fare Information</Text>
        </View>
        <View style={styles.fareContent}>
          <View style={styles.fareItem}>
            <Text style={[styles.fareValue, { color: theme.colors.onSurface }]}>
              {formatFare(route.base_fare || 13)}
            </Text>
            <Text style={[styles.fareLabel, { color: theme.colors.onSurfaceVariant }]}>Base Fare</Text>
          </View>
          <View style={styles.fareItem}>
            <Text style={[styles.fareValue, { color: theme.colors.onSurface }]}>
              +{formatFare(route.per_km_rate || 1.8)}
            </Text>
            <Text style={[styles.fareLabel, { color: theme.colors.onSurfaceVariant }]}>Per KM</Text>
          </View>
        </View>
        <View style={[styles.discountBanner, { backgroundColor: '#E8F5E9' }]}>
          <MaterialCommunityIcons name="ticket-percent" size={16} color="#4CAF50" />
          <Text style={styles.discountText}>20% discount for students, seniors, and PWD</Text>
        </View>
      </View>

      {route.stops && route.stops.length > 1 && (
        <View style={styles.fareEstimatorContainer}>
          <FareEstimator
            route={route}
            stops={route.stops}
            routeColor={routeColor}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fareCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fareTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  fareContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  fareItem: {
    flex: 1,
    alignItems: 'center',
  },
  fareValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  fareLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    flex: 1,
  },
  fareEstimatorContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
});
