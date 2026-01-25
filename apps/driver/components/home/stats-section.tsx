import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatCard } from '@jeepneygo/ui';

interface ActiveTripBannerProps {
  passengerCount: number;
  onPress: () => void;
}

interface TodayStatsGridProps {
  isLoading: boolean;
  tripsToday: number;
  hoursOnline: number;
  passengersToday: number;
}

interface StartDrivingButtonProps {
  hasActiveTrip: boolean;
  onPress: () => void;
}

export function ActiveTripBanner({ passengerCount, onPress }: ActiveTripBannerProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.activeTripBanner, { backgroundColor: '#E8F5E9' }]}
    >
      <View style={styles.activeTripLeft}>
        <View style={styles.activeTripDot} />
        <View>
          <Text style={[styles.activeTripTitle, { color: '#2E7D32' }]}>Trip in Progress</Text>
          <Text style={[styles.activeTripSubtitle, { color: '#558B2F' }]}>
            {passengerCount} passengers on board
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#2E7D32" />
    </Pressable>
  );
}

export function TodayStatsGrid({ isLoading, tripsToday, hoursOnline, passengersToday }: TodayStatsGridProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loadingStats}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.statsGrid}>
      <StatCard icon="steering" value={tripsToday} label="Trips" iconColor={theme.colors.primary} />
      <StatCard icon="clock-outline" value={`${hoursOnline}h`} label="Online" iconColor="#FF9800" />
      <StatCard icon="account-group" value={passengersToday} label="Passengers" iconColor="#4CAF50" />
    </View>
  );
}

export function StartDrivingButton({ hasActiveTrip, onPress }: StartDrivingButtonProps) {
  const theme = useTheme();

  return (
    <View style={styles.ctaSection}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.ctaButton,
          { backgroundColor: pressed ? '#E5A700' : theme.colors.primary }
        ]}
      >
        <View style={styles.ctaContent}>
          <MaterialCommunityIcons name="steering" size={24} color="#000000" />
          <Text style={styles.ctaText}>{hasActiveTrip ? 'Continue Driving' : 'Start Driving'}</Text>
        </View>
      </Pressable>
      <Text style={[styles.ctaHint, { color: theme.colors.onSurfaceVariant }]}>
        {hasActiveTrip ? 'Return to your active trip' : 'Go online and start accepting trips'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
});
