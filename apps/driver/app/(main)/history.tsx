import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SkeletonList, EmptyState } from '@jeepneygo/ui';
import { useAuthStore, useTripHistory } from '@jeepneygo/core';

type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function HistoryScreen() {
  const theme = useTheme();
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

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>
          {dateFilter === 'all' ? 'All Time' : dateFilter === 'today' ? "Today's" : dateFilter === 'week' ? "This Week's" : "This Month's"} Summary
        </Text>
        <MaterialCommunityIcons name="chart-line" size={20} color="rgba(0,0,0,0.3)" />
      </View>
      <View style={styles.summaryStats}>
        <View style={styles.summaryStat}>
          <Text style={styles.summaryStatValue}>{summaryStats.totalTrips}</Text>
          <Text style={styles.summaryStatLabel}>Trips</Text>
        </View>
        <View style={styles.summaryStatDivider} />
        <View style={styles.summaryStat}>
          <Text style={styles.summaryStatValue}>{summaryStats.totalPassengers}</Text>
          <Text style={styles.summaryStatLabel}>Passengers</Text>
        </View>
        <View style={styles.summaryStatDivider} />
        <View style={styles.summaryStat}>
          <Text style={styles.summaryStatValue}>{summaryStats.totalHours}h</Text>
          <Text style={styles.summaryStatLabel}>Online</Text>
        </View>
      </View>
      <View style={styles.earningsRow}>
        <MaterialCommunityIcons name="wallet" size={18} color="rgba(0,0,0,0.5)" />
        <Text style={styles.earningsText}>₱{summaryStats.totalEarnings.toLocaleString()} estimated earnings</Text>
      </View>
    </View>
  );

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      {filterOptions.map((option) => (
        <Pressable
          key={option.key}
          onPress={() => setDateFilter(option.key)}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                dateFilter === option.key ? theme.colors.primaryContainer : theme.colors.surface,
              borderColor:
                dateFilter === option.key ? theme.colors.primary : theme.colors.outlineVariant,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              {
                color:
                  dateFilter === option.key ? theme.colors.primary : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderTripCard = ({ item }: { item: (typeof trips)[0] }) => {
    const routeColor = item.route?.color || '#FFB800';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.tripCard,
          { backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface },
        ]}
      >
        <View style={[styles.tripColorBar, { backgroundColor: routeColor }]} />
        <View style={styles.tripContent}>
          <View style={styles.tripHeader}>
            <View style={styles.tripRouteInfo}>
              <Text style={[styles.tripRouteName, { color: theme.colors.onSurface }]}>
                {item.route?.short_name || 'Unknown'}
              </Text>
              <Text style={[styles.tripRouteDescription, { color: theme.colors.onSurfaceVariant }]}>
                {item.route?.name || 'Unknown Route'}
              </Text>
            </View>
            <View style={styles.tripDateContainer}>
              <Text style={[styles.tripDate, { color: theme.colors.onSurfaceVariant }]}>
                {formatDate(item.ended_at)}
              </Text>
              <Text style={[styles.tripTime, { color: theme.colors.onSurfaceVariant }]}>
                {formatTime(item.started_at)}
              </Text>
            </View>
          </View>

          <View style={styles.tripStatsRow}>
            <View style={styles.tripStat}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.tripStatText, { color: theme.colors.onSurface }]}>
                {formatDuration(item.started_at, item.ended_at)}
              </Text>
            </View>
            <View style={styles.tripStat}>
              <MaterialCommunityIcons name="account-group" size={16} color="#4CAF50" />
              <Text style={[styles.tripStatText, { color: theme.colors.onSurface }]}>
                {item.total_passengers} passengers
              </Text>
            </View>
            <View style={styles.tripStat}>
              <MaterialCommunityIcons name="cash" size={16} color="#F57C00" />
              <Text style={[styles.tripStatText, { color: theme.colors.onSurface }]}>
                ~₱{(item.total_passengers * 13).toFixed(0)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  if (isLoading && trips.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Trip History</Text>
        </View>
        <SkeletonList count={5} cardProps={{ lines: 3 }} style={styles.skeletonList} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripCard}
        ListHeaderComponent={
          <>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>Trip History</Text>
              <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
                {dateFilter !== 'all' ? ` (${filterOptions.find((f) => f.key === dateFilter)?.label})` : ''}
              </Text>
            </View>
            {renderSummaryCard()}
            {renderFilterChips()}
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Recent Trips</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            type="no-history"
            title="No trips found"
            description={
              dateFilter !== 'all'
                ? `No trips recorded for ${filterOptions.find((f) => f.key === dateFilter)?.label.toLowerCase()}`
                : 'Start driving to see your trip history here'
            }
          />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredTrips.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.7)',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A237E',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  summaryStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  earningsText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.6)',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  tripCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tripColorBar: {
    width: 5,
  },
  tripContent: {
    flex: 1,
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripRouteInfo: {
    flex: 1,
  },
  tripRouteName: {
    fontSize: 16,
    fontWeight: '700',
  },
  tripRouteDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  tripDateContainer: {
    alignItems: 'flex-end',
  },
  tripDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  tripTime: {
    fontSize: 11,
    marginTop: 2,
  },
  tripStatsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  tripStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripStatText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  skeletonList: {
    paddingHorizontal: 20,
  },
});
