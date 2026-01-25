import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore, useTripHistory, useDriverVehicle, useTripStore } from '@jeepneygo/core';
import {
  ProfileHeader,
  ProfileStats,
  MenuSection,
  SignOutButton,
  AppVersion,
  type MenuItem,
} from '../../components/profile';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [refreshing, setRefreshing] = useState(false);

  // get current trip data from store
  const activeTrip = useTripStore((state) => state.activeTrip);
  const currentTripPassengers = useTripStore((state) => state.regularPassengers + state.discountedPassengers);
  const tripStartTime = useTripStore((state) => state.tripStartTime);

  const { trips, isLoading: tripsLoading, refetch: refetchTrips } = useTripHistory({
    driverId: user?.id,
    limit: 1000,
    includeRoute: false,
  });

  const { vehicle, isLoading: vehicleLoading, refetch: refetchVehicle } = useDriverVehicle(user?.id);

  // calculate stats from completed trips
  const completedTrips = trips.length;
  const completedPassengers = trips.reduce((sum, trip) => sum + (trip.total_passengers || 0), 0);
  const completedHours = trips.reduce((sum, trip) => {
    const start = new Date(trip.started_at).getTime();
    const end = new Date(trip.ended_at).getTime();
    return sum + (end - start) / 1000 / 3600;
  }, 0);

  // add current trip data if active
  const totalTrips = completedTrips + (activeTrip ? 1 : 0);
  const totalPassengers = completedPassengers + currentTripPassengers;
  const currentTripHours = activeTrip && tripStartTime
    ? (Date.now() - tripStartTime) / 1000 / 3600
    : 0;
  const totalHours = Math.round((completedHours + currentTripHours) * 10) / 10;

  const driverRating = 4.8;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTrips(), refetchVehicle()]);
    setRefreshing(false);
  }, [refetchTrips, refetchVehicle]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const accountMenuItems: MenuItem[] = [
    {
      id: 'edit-profile',
      icon: 'account-edit',
      iconColor: '#1976D2',
      iconBg: '#E3F2FD',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      route: '/edit-profile',
    },
    {
      id: 'vehicle-info',
      icon: 'bus',
      iconColor: '#F57C00',
      iconBg: '#FFF3E0',
      title: 'Vehicle Information',
      subtitle: vehicle?.plate_number || 'View your assigned vehicle',
      route: '/vehicle-info',
    },
    {
      id: 'license',
      icon: 'card-account-details',
      iconColor: '#7B1FA2',
      iconBg: '#F3E5F5',
      title: 'License Details',
      subtitle: 'View your license information',
      route: '/license-details',
    },
    {
      id: 'history',
      icon: 'history',
      iconColor: '#00897B',
      iconBg: '#E0F2F1',
      title: 'Trip History',
      subtitle: `${totalTrips} trips completed`,
      route: '/history',
    },
    {
      id: 'earnings',
      icon: 'wallet',
      iconColor: '#43A047',
      iconBg: '#E8F5E9',
      title: 'Earnings & Payments',
      subtitle: 'View your earnings summary',
      route: '/earnings',
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      id: 'notifications',
      icon: 'bell-outline',
      iconColor: '#E53935',
      iconBg: '#FFEBEE',
      title: 'Notifications',
      subtitle: 'Manage push notifications',
      route: '/notifications',
    },
    {
      id: 'support',
      icon: 'help-circle-outline',
      iconColor: '#5E35B1',
      iconBg: '#EDE7F6',
      title: 'Help & Support',
      subtitle: 'Get help with the app',
      route: '/support',
    },
    {
      id: 'about',
      icon: 'information-outline',
      iconColor: '#546E7A',
      iconBg: '#ECEFF1',
      title: 'About',
      subtitle: 'App version and info',
      route: '/about',
    },
  ];

  const isLoading = tripsLoading || vehicleLoading;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Profile</Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
        <ProfileHeader user={user} driverRating={driverRating} />
        <ProfileStats
          isLoading={isLoading}
          totalTrips={totalTrips}
          totalPassengers={totalPassengers}
          totalHours={totalHours}
        />
      </View>

      <MenuSection title="Account" items={accountMenuItems} />
      <MenuSection title="Settings" items={settingsMenuItems} />

      <SignOutButton onSignOut={handleSignOut} />
      <AppVersion />

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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
