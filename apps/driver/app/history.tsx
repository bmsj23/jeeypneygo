import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SkeletonList, EmptyState } from '@jeepneygo/ui';
import { useAuthStore, useTripHistory } from '@jeepneygo/core';

type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { trips, isLoading, refetch } = useTripHistory({
    driverId: user?.id,
    limit: 100,
    includeRoute: true,
  });

  const filteredTrips = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return trips.filter((trip) => {
      const tripDate = new Date(trip.ended_at);
      switch (dateFilter) {
        case 'today':
          return tripDate >= today;
        case 'week':
          return tripDate >= weekAgo;
        case 'month':
          return tripDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [trips, dateFilter]);

  const summaryStats = useMemo(() => {
    const totalTrips = filteredTrips.length;
    const totalPassengers = filteredTrips.reduce((sum, t) => sum + (t.total_passengers || 0), 0);
    const totalSeconds = filteredTrips.reduce((sum, t) => {
      const start = new Date(t.started_at).getTime();
      const end = new Date(t.ended_at).getTime();
      return sum + (end - start) / 1000;
    }, 0);
    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
    const totalEarnings = totalTrips * 150;

    return { totalTrips, totalPassengers, totalHours, totalEarnings };
  }, [filteredTrips]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (startedAt: string, endedAt: string): string => {
    const start = new Date(startedAt).getTime();
    const end = new Date(endedAt).getTime();
    const seconds = Math.floor((end - start) / 1000);

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const filterOptions: { key: DateFilter; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  const getRouteColor = (color?: string) => color || '#FFB800';

  const renderTripCard = ({ item }: { item: (typeof trips)[0] }) => (
    <View style={[styles.tripCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.routeColorBar, { backgroundColor: getRouteColor(item.route?.color) }]} />
      <View style={styles.tripContent}>
        <View style={styles.tripHeader}>
          <View style={styles.tripRouteInfo}>
            <Text style={[styles.routeName, { color: theme.colors.onSurface }]}>
              {item.route?.name || 'Unknown Route'}
            </Text>
            <Text style={[styles.tripDate, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(item.ended_at)} • {formatTime(item.started_at)}
            </Text>
          </View>
          <View style={[styles.earningsBadge, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.earningsText}>₱{(item.total_passengers || 0) * 13}</Text>
          </View>
        </View>

        <View style={styles.tripStats}>
          <View style={styles.tripStat}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.tripStatText, { color: theme.colors.onSurfaceVariant }]}>
              {formatDuration(item.started_at, item.ended_at)}
            </Text>
          </View>
          <View style={styles.tripStat}>
            <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.tripStatText, { color: theme.colors.onSurfaceVariant }]}>
              {item.total_passengers || 0} passengers
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* summary card */}
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {summaryStats.totalTrips}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Trips</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outline }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {summaryStats.totalPassengers}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
              Passengers
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outline }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {summaryStats.totalHours}h
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Hours</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outline }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              ₱{summaryStats.totalEarnings.toLocaleString()}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
              Earnings
            </Text>
          </View>
        </View>
      </View>

      {/* filter chips */}
      <View style={styles.filterRow}>
        {filterOptions.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => setDateFilter(option.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  dateFilter === option.key ? theme.colors.primary : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: dateFilter === option.key ? '#1A237E' : theme.colors.onSurfaceVariant,
                  fontWeight: dateFilter === option.key ? '600' : '500',
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* section title */}
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {dateFilter === 'all' ? 'All Trips' : `${filterOptions.find((f) => f.key === dateFilter)?.label}`}
        {' '}({filteredTrips.length})
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Trip History',
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
            headerStyle: { backgroundColor: theme.colors.background },
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
              </Pressable>
            ),
          }}
        />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <SkeletonList count={5} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Trip History',
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            type="no-history"
            title="No trips found"
            description={
              dateFilter === 'all'
                ? "You haven't completed any trips yet"
                : `No trips found for ${filterOptions.find((f) => f.key === dateFilter)?.label.toLowerCase()}`
            }
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 16 },
        ]}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerContent: {
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    opacity: 0.3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tripCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  routeColorBar: {
    width: 4,
  },
  tripContent: {
    flex: 1,
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripRouteInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
  },
  earningsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  earningsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tripStats: {
    flexDirection: 'row',
    gap: 16,
  },
  tripStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripStatText: {
    fontSize: 12,
  },
});
