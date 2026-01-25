import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatCard } from '@jeepneygo/ui';
import { useAuthStore, useTripHistory, useDriverVehicle } from '@jeepneygo/core';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface MenuItem {
  id: string;
  icon: IconName;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  route?: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [refreshing, setRefreshing] = useState(false);

  const { trips, isLoading: tripsLoading, refetch: refetchTrips } = useTripHistory({
    driverId: user?.id,
    limit: 1000,
    includeRoute: false,
  });

  const { vehicle, isLoading: vehicleLoading, refetch: refetchVehicle } = useDriverVehicle(user?.id);

  const totalTrips = trips.length;
  const totalPassengers = trips.reduce((sum, trip) => sum + (trip.total_passengers || 0), 0);
  const totalHours = Math.round(
    trips.reduce((sum, trip) => {
      const start = new Date(trip.started_at).getTime();
      const end = new Date(trip.ended_at).getTime();
      return sum + (end - start) / 1000 / 3600;
    }, 0) * 10
  ) / 10;

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const renderMenuItem = (item: MenuItem) => (
    <Pressable
      key={item.id}
      onPress={() => item.route && router.push(item.route as never)}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface },
      ]}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
        <Text style={[styles.menuSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {item.subtitle}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );

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
        <View style={styles.profileTop}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>{getInitials(user?.display_name || 'D')}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
              {user?.display_name || 'Driver'}
            </Text>
            <Text style={[styles.profilePhone, { color: theme.colors.onSurfaceVariant }]}>
              {user?.phone || user?.email || 'No contact info'}
            </Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFB800" />
              <Text style={[styles.ratingText, { color: theme.colors.onSurface }]}>
                {driverRating.toFixed(1)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: user?.is_approved ? '#E8F5E9' : theme.colors.primaryContainer },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: user?.is_approved ? '#4CAF50' : theme.colors.primary },
                  ]}
                >
                  {user?.is_approved ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.statsRow}>
            <StatCard
              icon="steering"
              value={totalTrips}
              label="Trips"
              iconColor={theme.colors.primary}
              size="small"
            />
            <View style={{ width: 8 }} />
            <StatCard
              icon="account-group"
              value={totalPassengers}
              label="Passengers"
              iconColor="#4CAF50"
              size="small"
            />
            <View style={{ width: 8 }} />
            <StatCard
              icon="clock-outline"
              value={`${totalHours}h`}
              label="Online"
              iconColor="#FF9800"
              size="small"
            />
          </View>
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Account</Text>
      <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
        {accountMenuItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {renderMenuItem(item)}
            {index < accountMenuItems.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Settings</Text>
      <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
        {settingsMenuItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {renderMenuItem(item)}
            {index < settingsMenuItems.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <Pressable
        onPress={handleSignOut}
        style={({ pressed }) => [
          styles.signOutButton,
          {
            backgroundColor: pressed ? '#FFEBEE' : theme.colors.surface,
            borderColor: '#F44336',
          },
        ]}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
        JeepneyGo Driver v1.7.0
      </Text>

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
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A237E',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profilePhone: {
    fontSize: 14,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsLoading: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F44336',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 20,
  },
});
