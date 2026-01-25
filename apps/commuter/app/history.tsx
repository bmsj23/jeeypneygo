import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '@jeepneygo/ui';
import {
  HistorySummaryCard,
  DateFilterChips,
  TripCard,
  getFilterLabel,
  type DateFilter,
} from '../components/history';

const mockTrips = [
  {
    id: '1',
    routeName: 'Batangas City ↔ Lipa City',
    routeColor: '#E53935',
    startStop: 'Batangas City Grand Terminal',
    endStop: 'SM City Lipa Grand Terminal',
    fare: 45,
    date: 'Today, 2:30 PM',
  },
  {
    id: '2',
    routeName: 'Mataas na Kahoy ↔ Lipa City',
    routeColor: '#FFB800',
    startStop: 'Mataas na Kahoy Poblacion',
    endStop: 'Lipa City Palengke',
    fare: 25,
    date: 'Yesterday, 9:15 AM',
  },
  {
    id: '3',
    routeName: 'Lemery ↔ Lipa City',
    routeColor: '#FF9800',
    startStop: 'Lemery Public Terminal',
    endStop: 'SM City Lipa Grand Terminal',
    fare: 35,
    date: 'Jan 23, 4:45 PM',
  },
];

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const filteredTrips = useMemo(() => {
    return mockTrips;
  }, [dateFilter]);

  const summaryStats = useMemo(() => {
    const totalTrips = filteredTrips.length;
    const totalRoutes = [...new Set(filteredTrips.map((t) => t.routeName))].length;
    const totalFare = filteredTrips.reduce((sum, t) => sum + t.fare, 0);
    return { totalTrips, totalRoutes, totalFare };
  }, [filteredTrips]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <HistorySummaryCard stats={summaryStats} />
      <DateFilterChips selected={dateFilter} onSelect={setDateFilter} />
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {getFilterLabel(dateFilter)} ({filteredTrips.length})
      </Text>
    </View>
  );

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
        renderItem={({ item }) => <TripCard trip={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            type="no-history"
            title="No trips found"
            description={
              dateFilter === 'all'
                ? "You haven't taken any trips yet"
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
