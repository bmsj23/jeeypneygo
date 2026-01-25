import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore, useTodayStats, useTripStore } from '@jeepneygo/core';
import {
  WelcomeHeader,
  EarningsCard,
  ActiveTripBanner,
  TodayStatsGrid,
  StartDrivingButton,
  QuickActionsRow,
  VehicleCard,
} from '../../components/home';

export default function DriverHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const activeTrip = useTripStore((state) => state.activeTrip);
  const currentTripFare = useTripStore((state) => state.totalFare);
  const currentTripPassengers = useTripStore((state) => state.regularPassengers + state.discountedPassengers);

  const { tripsToday, passengersToday, hoursOnline, earningsToday, isLoading, refetch } = useTodayStats(user?.id);

  useEffect(() => {
    refetch();
  }, []);

  const handleStartDriving = () => {
    router.push('/(main)/drive');
  };

  // combine historical earnings with current trip earnings
  const totalEarningsToday = earningsToday + currentTripFare;
  const totalPassengersToday = passengersToday + currentTripPassengers;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <WelcomeHeader user={user} />

      <EarningsCard
        earningsToday={totalEarningsToday}
        tripsToday={tripsToday}
        passengersToday={totalPassengersToday}
      />

      {activeTrip && (
        <ActiveTripBanner
          passengerCount={activeTrip.passenger_count}
          onPress={handleStartDriving}
        />
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Today's Summary</Text>
      <TodayStatsGrid
        isLoading={isLoading}
        tripsToday={tripsToday}
        hoursOnline={hoursOnline}
        passengersToday={totalPassengersToday}
      />

      <StartDrivingButton
        hasActiveTrip={!!activeTrip}
        onPress={handleStartDriving}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Quick Actions</Text>
      <QuickActionsRow />

      <VehicleCard />

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
});
