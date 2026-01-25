import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SkeletonList, EmptyState } from '@jeepneygo/ui';
import { useAuthStore, useTripHistory } from '@jeepneygo/core';
import {
  HistorySummaryCard,
  DateFilterChips,
  TripCard,
  getFilterLabel,
  type DateFilter,
} from '../components/history';

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

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <HistorySummaryCard stats={summaryStats} />
      <DateFilterChips selected={dateFilter} onSelect={setDateFilter} />
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {dateFilter === 'all' ? 'All Trips' : getFilterLabel(dateFilter)}
        {' '}({filteredTrips.length})
      </Text>
    </View>
  );

  const headerOptions = {
    headerShown: true,
    headerTitle: 'Trip History',
    headerTitleStyle: { fontWeight: '600' as const },
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.colors.background },
    headerLeft: () => (
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
      </Pressable>
    ),
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <SkeletonList count={5} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <FlatList
        data={filteredTrips}
        renderItem={({ item }) => <TripCard trip={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            type="no-history"
            title="No trips found"
            description={
              dateFilter === 'all'
                ? "You haven't completed any trips yet"
                : `No trips found for ${getFilterLabel(dateFilter).toLowerCase()}`
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});
