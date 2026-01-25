import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '@jeepneygo/ui';
import type { RouteWithStops } from '@jeepneygo/core';

interface RouteHeaderProps {
  route: RouteWithStops | undefined;
  routeName?: string;
  routeColor: string;
  activeTripsCount: number;
  totalPassengers: number;
  isLoading: boolean;
  paddingTop: number;
  onBack: () => void;
}

export function RouteHeader({
  route,
  routeName,
  routeColor,
  activeTripsCount,
  totalPassengers,
  isLoading,
  paddingTop,
  onBack,
}: RouteHeaderProps) {
  const theme = useTheme();

  if (isLoading && !route) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!route) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: paddingTop + 12, backgroundColor: theme.colors.primary }]}>
          <View style={styles.headerTop}>
            <Pressable onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.routeName}>Route Not Found</Text>
        </View>
        <View style={styles.loadingContainer}>
          <EmptyState
            type="no-routes"
            title="Route not found"
            description="This route may have been removed or is temporarily unavailable."
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.header, { paddingTop: paddingTop + 12, backgroundColor: routeColor }]}>
      <View style={styles.headerTop}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.routeBadge}>
          <Text style={styles.shortName}>{route.short_name}</Text>
        </View>
      </View>

      <View style={styles.headerContent}>
        <View style={[styles.routeIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <MaterialCommunityIcons name="bus" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.routeName} numberOfLines={2}>
          {routeName || route.name}
        </Text>
        <Text style={styles.operatingHours}>
          {route.operating_start && route.operating_end
            ? `${route.operating_start} - ${route.operating_end}`
            : '5:00 AM - 9:00 PM'}
        </Text>
      </View>

      {/* stats card */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: activeTripsCount > 0 ? '#4CAF50' : theme.colors.onSurfaceVariant }]}>
            {activeTripsCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            Active
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {route.stops?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            Stops
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
            {totalPassengers}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            Riding
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 50,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  routeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  shortName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  routeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  operatingHours: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
