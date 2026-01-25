import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Route } from '@jeepneygo/core';

interface VehicleRouteCardProps {
  route: Route | undefined;
}

export function VehicleRouteCard({ route }: VehicleRouteCardProps) {
  const theme = useTheme();
  const getRouteColor = (color?: string) => color || '#FFB800';

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Assigned Route
      </Text>
      {route ? (
        <View style={[styles.routeCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.routeColorBar, { backgroundColor: getRouteColor(route.color) }]} />
          <View style={styles.routeContent}>
            <View style={styles.routeHeader}>
              <View
                style={[
                  styles.routeIconContainer,
                  { backgroundColor: `${getRouteColor(route.color)}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name="routes"
                  size={20}
                  color={getRouteColor(route.color)}
                />
              </View>
              <View style={styles.routeInfo}>
                <Text style={[styles.routeName, { color: theme.colors.onSurface }]}>
                  {route.name}
                </Text>
                <Text style={[styles.routeDescription, { color: theme.colors.onSurfaceVariant }]}>
                  {route.short_name || 'No route info available'}
                </Text>
              </View>
            </View>
            <View style={styles.routeStats}>
              <View style={styles.routeStat}>
                <MaterialCommunityIcons name="cash" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.routeStatText, { color: theme.colors.onSurfaceVariant }]}>
                  ₱{route.base_fare?.toFixed(2) || '0.00'} base fare
                </Text>
              </View>
              <View style={styles.routeStat}>
                <MaterialCommunityIcons name="map-marker-distance" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.routeStatText, { color: theme.colors.onSurfaceVariant }]}>
                  ₱{route.per_km_rate?.toFixed(2) || '0.00'}/km
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.noRouteCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="routes" size={24} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.noRouteText, { color: theme.colors.onSurfaceVariant }]}>
            No route assigned to this vehicle
          </Text>
        </View>
      )}
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
  routeCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  routeColorBar: {
    width: 6,
  },
  routeContent: {
    flex: 1,
    padding: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    fontSize: 13,
  },
  noRouteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  noRouteText: {
    fontSize: 14,
  },
});