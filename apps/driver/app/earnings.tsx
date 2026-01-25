import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore, useTripHistory } from '@jeepneygo/core';
import {
  PeriodSelector,
  EarningsHero,
  QuickStatsRow,
  EarningsChart,
  EarningsBreakdown,
  type TimePeriod,
} from '../components/earnings';

export default function EarningsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [refreshing, setRefreshing] = useState(false);

  const { trips, refetch } = useTripHistory({
    driverId: user?.id,
    limit: 500,
    includeRoute: true,
  });

  const earningsData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let filteredTrips = trips;
    switch (selectedPeriod) {
      case 'today':
        filteredTrips = trips.filter((t) => new Date(t.ended_at) >= today);
        break;
      case 'week':
        filteredTrips = trips.filter((t) => new Date(t.ended_at) >= weekAgo);
        break;
      case 'month':
        filteredTrips = trips.filter((t) => new Date(t.ended_at) >= monthAgo);
        break;
    }

    const totalTrips = filteredTrips.length;
    const totalPassengers = filteredTrips.reduce((sum, t) => sum + (t.total_passengers || 0), 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalEarnings = filteredTrips.reduce((sum, t: any) => {
      if (t.gross_earnings !== undefined && t.gross_earnings !== null) {
        return sum + t.gross_earnings;
      }
      if (t.total_fare !== undefined && t.total_fare !== null) {
        return sum + t.total_fare;
      }
      return sum + (t.total_passengers || 0) * 13;
    }, 0);

    const avgEarningsPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
    const avgEarningsPerPassenger = totalPassengers > 0 ? totalEarnings / totalPassengers : 13;

    const dailyEarnings: { day: string; earnings: number; trips: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const dayTrips = trips.filter((t) => {
        const tripDate = new Date(t.ended_at);
        return tripDate >= date && tripDate < nextDate;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dayEarnings = dayTrips.reduce((sum, t: any) => {
        if (t.gross_earnings !== undefined && t.gross_earnings !== null) {
          return sum + t.gross_earnings;
        }
        if (t.total_fare !== undefined && t.total_fare !== null) {
          return sum + t.total_fare;
        }
        return sum + (t.total_passengers || 0) * 13;
      }, 0);
      dailyEarnings.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        earnings: dayEarnings,
        trips: dayTrips.length,
      });
    }

    const maxDailyEarning = Math.max(...dailyEarnings.map((d) => d.earnings), 1);

    return {
      totalTrips,
      totalPassengers,
      totalEarnings,
      avgEarningsPerTrip,
      avgEarningsPerPassenger,
      dailyEarnings,
      maxDailyEarning,
    };
  }, [trips, selectedPeriod]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Earnings',
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
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <PeriodSelector selected={selectedPeriod} onSelect={setSelectedPeriod} />

        <EarningsHero
          totalEarnings={earningsData.totalEarnings}
          totalTrips={earningsData.totalTrips}
          totalPassengers={earningsData.totalPassengers}
        />

        <QuickStatsRow
          avgPerTrip={earningsData.avgEarningsPerTrip}
          avgPerPassenger={earningsData.avgEarningsPerPassenger}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Last 7 Days
        </Text>
        <EarningsChart
          dailyEarnings={earningsData.dailyEarnings}
          maxEarning={earningsData.maxDailyEarning}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Breakdown
        </Text>
        <EarningsBreakdown
          totalPassengers={earningsData.totalPassengers}
          totalEarnings={earningsData.totalEarnings}
        />

        <View style={[styles.infoCard, { backgroundColor: '#E3F2FD' }]}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            Earnings are estimated based on average fare rates. Actual earnings may vary depending on fare adjustments and discounts.
          </Text>
        </View>

        <Pressable
          onPress={() => {}}
          style={({ pressed }) => [
            styles.exportButton,
            {
              backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <MaterialCommunityIcons name="file-export-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.exportButtonText, { color: theme.colors.primary }]}>
            Export Earnings Report
          </Text>
        </Pressable>

        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
