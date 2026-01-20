import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteCard, SectionHeader, EmptyState } from '@jeepneygo/ui';
import { useRoutes, useActiveTrips, type RouteWithStops } from '@jeepneygo/core';

export default function RoutesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { routes, isLoading, error } = useRoutes({ includeStops: true });
  const { trips } = useActiveTrips({});

  // get active jeepney counts per route
  const routeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    trips.forEach(trip => {
      counts[trip.route_id] = (counts[trip.route_id] || 0) + 1;
    });
    return counts;
  }, [trips]);

  const handleRoutePress = (route: RouteWithStops) => {
    router.push({
      pathname: '/route-details' as any,
      params: { routeId: route.id, routeName: route.name },
    });
  };

  const renderRoute = ({ item }: { item: RouteWithStops }) => {
    const activeCount = routeCounts[item.id] || 0;

    return (
      <View style={styles.routeCardWrapper}>
        <Pressable
          onPress={() => handleRoutePress(item)}
          style={({ pressed }) => [
            styles.routeCard,
            { backgroundColor: theme.colors.surface, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {/* color indicator */}
          <View style={[styles.colorIndicator, { backgroundColor: item.color || '#FFB800' }]} />

          {/* main content */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Text style={[styles.routeName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {activeCount > 0 && (
                  <View style={[styles.liveBadge, { backgroundColor: '#4CAF50' }]}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>{activeCount} active</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.shortName, { color: theme.colors.onSurfaceVariant }]}>
                {item.short_name}
              </Text>
            </View>

            {/* stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                  {item.operating_start || '5:00 AM'} - {item.operating_end || '9:00 PM'}
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="map-marker-multiple" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                  {item.stops?.length || 0} stops
                </Text>
              </View>
            </View>

            {/* fare badge */}
            <View style={styles.fareRow}>
              <View style={[styles.fareBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.fareText, { color: theme.colors.primary }]}>
                  ₱{(item.base_fare || 13).toFixed(0)} base fare
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading routes...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          type="no-routes"
          title="Failed to load routes"
          description={error.message}
        />
      </View>
    );
  }

  const totalActive = trips.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* hero header */}
      <View style={[styles.heroHeader, { paddingTop: insets.top + 16, backgroundColor: theme.colors.primary }]}>
        <Text style={styles.heroTitle}>Jeepney Routes</Text>
        <Text style={styles.heroSubtitle}>
          {routes.length} routes in Lipa City
        </Text>

        {/* active summary card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{routes.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Routes</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{totalActive}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Active Now</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {(routes as RouteWithStops[]).reduce((sum, r) => sum + (r.stops?.length || 0), 0)}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Total Stops</Text>
          </View>
        </View>
      </View>

      {/* routes list */}
      <FlatList
        data={routes as RouteWithStops[]}
        keyExtractor={(item) => item.id}
        renderItem={renderRoute}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <SectionHeader title="All Routes" subtitle="Tap to view stops and details" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'absolute',
    bottom: -40,
    left: 20,
    right: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    alignSelf: 'center',
  },
  list: {
    paddingTop: 50,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  routeCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  routeCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  colorIndicator: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  shortName: {
    fontSize: 13,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fareBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fareText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
