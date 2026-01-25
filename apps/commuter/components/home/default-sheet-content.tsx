import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuickActionsRow, QuickActionButton, SectionHeader, JeepneyETACard } from '@jeepneygo/ui';
import { isLocationStale, type ActiveTripWithDetails, type Route } from '@jeepneygo/core';

interface NearbyJeepney extends ActiveTripWithDetails {
  etaMinutes: number;
  distance: string;
}

interface DefaultSheetContentProps {
  isAuthenticated: boolean;
  nearbyJeepneys: NearbyJeepney[];
  tripCount: number;
  getRouteForTrip: (trip: ActiveTripWithDetails) => Route | undefined;
  onJeepneyPress: (trip: ActiveTripWithDetails) => void;
  onCollapseSheet: () => void;
}

export function DefaultSheetContent({
  isAuthenticated,
  nearbyJeepneys,
  tripCount,
  getRouteForTrip,
  onJeepneyPress,
  onCollapseSheet,
}: DefaultSheetContentProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <>
      <QuickActionsRow>
        <QuickActionButton icon="map-marker-multiple" label="All Stops" onPress={() => router.push('/routes')} color="#4CAF50" />
        <QuickActionButton icon="heart" label="Favorites" onPress={() => router.push('/favorites')} color="#E91E63" />
        <QuickActionButton icon="bus-clock" label="Routes" onPress={() => router.push('/routes')} color="#2196F3" />
        <QuickActionButton icon="account" label="Profile" onPress={() => router.push('/profile')} color="#9C27B0" />
      </QuickActionsRow>

      {!isAuthenticated && (
        <Pressable
          onPress={() => router.push('/(auth)/login' as any)}
          style={[styles.guestBanner, { backgroundColor: theme.colors.primaryContainer }]}
        >
          <MaterialCommunityIcons name="account-plus" size={24} color={theme.colors.primary} />
          <View style={styles.guestBannerText}>
            <Text style={[styles.guestTitle, { color: theme.colors.primary }]}>Sign in for more features</Text>
            <Text style={[styles.guestSubtitle, { color: theme.colors.onPrimaryContainer }]}>
              Save favorites, get notifications
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.primary} />
        </Pressable>
      )}

      <SectionHeader
        title="Nearby Jeepneys"
        subtitle={`${tripCount} active now`}
        actionLabel="See map"
        onActionPress={onCollapseSheet}
      />

      {nearbyJeepneys.length === 0 ? (
        <View style={styles.emptyNearby}>
          <MaterialCommunityIcons name="bus-alert" size={48} color={theme.colors.outlineVariant} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No jeepneys nearby</Text>
        </View>
      ) : (
        nearbyJeepneys.map((trip) => {
          const route = getRouteForTrip(trip);
          return (
            <View key={trip.id} style={styles.jeepneyCardWrapper}>
              <JeepneyETACard
                plateNumber={trip.vehicle?.plate_number || 'Unknown'}
                driverName={trip.driver?.display_name || undefined}
                routeName={route?.name || 'Unknown Route'}
                routeColor={route?.color || '#FFB800'}
                etaMinutes={trip.etaMinutes}
                availableSeats={trip.vehicle?.capacity ? trip.vehicle.capacity - trip.passenger_count : 15}
                maxSeats={trip.vehicle?.capacity || 20}
                distance={trip.distance}
                isStale={trip.last_updated ? isLocationStale(trip.last_updated) : false}
                onPress={() => onJeepneyPress(trip)}
                onTrack={() => onJeepneyPress(trip)}
              />
            </View>
          );
        })
      )}
    </>
  );
}

const styles = StyleSheet.create({
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  guestBannerText: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  guestSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyNearby: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  jeepneyCardWrapper: {
    paddingHorizontal: 20,
  },
});
