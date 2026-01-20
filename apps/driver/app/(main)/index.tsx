import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, StatCard } from '@jeepneygo/ui';
import { useAuthStore, useTodayStats, useTripStore } from '@jeepneygo/core';

export default function DriverHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const activeTrip = useTripStore((state) => state.activeTrip);

  const { tripsToday, passengersToday, hoursOnline, isLoading, refetch } = useTodayStats(user?.id);

  useEffect(() => {
    refetch();
  }, []);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStartDriving = () => {
    router.push('/(main)/drive');
  };

  const todayEarnings = tripsToday * 150;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.onSurfaceVariant }]}>{getGreeting()}</Text>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>
            {user?.display_name || 'Driver'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(main)/profile')}
          style={[styles.profileButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons name="account" size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>
      </View>

      {/* earnings hero card */}
      <View style={[styles.earningsCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.earningsHeader}>
          <Text style={styles.earningsLabel}>Today's Earnings</Text>
          <MaterialCommunityIcons name="wallet" size={24} color="rgba(0,0,0,0.3)" />
        </View>
        <Text style={styles.earningsAmount}>₱{todayEarnings.toFixed(2)}</Text>
        <View style={styles.earningsFooter}>
          <View style={styles.earningsFooterItem}>
            <MaterialCommunityIcons name="car" size={16} color="rgba(0,0,0,0.5)" />
            <Text style={styles.earningsFooterText}>{tripsToday} trips</Text>
          </View>
          <View style={styles.earningsFooterItem}>
            <MaterialCommunityIcons name="account-group" size={16} color="rgba(0,0,0,0.5)" />
            <Text style={styles.earningsFooterText}>{passengersToday} passengers</Text>
          </View>
        </View>
      </View>

      {/* active trip banner */}
      {activeTrip && (
        <Pressable
          onPress={handleStartDriving}
          style={[styles.activeTripBanner, { backgroundColor: '#E8F5E9' }]}
        >
          <View style={styles.activeTripLeft}>
            <View style={styles.activeTripDot} />
            <View>
              <Text style={[styles.activeTripTitle, { color: '#2E7D32' }]}>Trip in Progress</Text>
              <Text style={[styles.activeTripSubtitle, { color: '#558B2F' }]}>
                {activeTrip.passenger_count} passengers on board
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#2E7D32" />
        </Pressable>
      )}

      {/* stats grid */}
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Today's Summary</Text>
      <View style={styles.statsGrid}>
        {isLoading ? (
          <View style={styles.loadingStats}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            <StatCard icon="steering" value={tripsToday} label="Trips" iconColor={theme.colors.primary} />
            <StatCard icon="clock-outline" value={`${hoursOnline}h`} label="Online" iconColor="#FF9800" />
            <StatCard icon="account-group" value={passengersToday} label="Passengers" iconColor="#4CAF50" />
          </>
        )}
      </View>

      {/* start driving CTA */}
      <View style={styles.ctaSection}>
        <Button mode="contained" onPress={handleStartDriving} style={styles.ctaButton}>
          <View style={styles.ctaContent}>
            <MaterialCommunityIcons name="steering" size={24} color="#000000" />
            <Text style={styles.ctaText}>{activeTrip ? 'Continue Driving' : 'Start Driving'}</Text>
          </View>
        </Button>
        <Text style={[styles.ctaHint, { color: theme.colors.onSurfaceVariant }]}>
          {activeTrip ? 'Return to your active trip' : 'Go online and start accepting trips'}
        </Text>
      </View>

      {/* quick actions */}
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <Pressable
          onPress={() => router.push('/(main)/history')}
          style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="history" size={24} color="#1976D2" />
          </View>
          <Text style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>History</Text>
          <Text style={[styles.quickActionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            View past trips
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(main)/profile')}
          style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
            <MaterialCommunityIcons name="account-cog" size={24} color="#F57C00" />
          </View>
          <Text style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>Settings</Text>
          <Text style={[styles.quickActionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Manage profile
          </Text>
        </Pressable>
      </View>

      {/* vehicle info card */}
      <Pressable style={[styles.vehicleCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.vehicleIcon, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="bus" size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={[styles.vehicleTitle, { color: theme.colors.onSurface }]}>Your Vehicle</Text>
          <Text style={[styles.vehiclePlate, { color: theme.colors.onSurfaceVariant }]}>
            Tap to view details
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
      </Pressable>

      {/* bottom padding for tab bar */}
      <View style={{ height: 100 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
  },
  earningsAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  earningsFooter: {
    flexDirection: 'row',
    gap: 24,
  },
  earningsFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsFooterText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.5)',
  },
  activeTripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  activeTripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeTripDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  activeTripTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeTripSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  loadingStats: {
    flex: 1,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 8,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  ctaHint: {
    fontSize: 13,
    marginTop: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 13,
  },
});
