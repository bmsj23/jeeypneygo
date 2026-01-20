import React, { forwardRef, useCallback, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, IconButton, Divider, Chip } from 'react-native-paper';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type { ActiveTripWithDetails } from '@jeepneygo/core';
import { getTimeAgo, isLocationStale, supabase } from '@jeepneygo/core';

interface JeepneyDetailsSheetProps {
  trip: ActiveTripWithDetails | null;
  onClose: () => void;
}

export const JeepneyDetailsSheet = forwardRef<BottomSheet, JeepneyDetailsSheetProps>(
  function JeepneyDetailsSheet({ trip, onClose }, ref) {
    const theme = useTheme();
    const snapPoints = useMemo(() => ['35%'], []);

    // local state for real-time updates
    const [liveTrip, setLiveTrip] = useState<ActiveTripWithDetails | null>(trip);

    // sync with prop when trip changes
    useEffect(() => {
      setLiveTrip(trip);
    }, [trip]);

    // subscribe to real-time updates for this specific trip
    useEffect(() => {
      if (!trip?.id) return;

      const channel = supabase
        .channel(`trip-details-${trip.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'active_trips',
            filter: `id=eq.${trip.id}`,
          },
          (payload) => {
            // merge updated fields with existing trip data to preserve relations
            setLiveTrip((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                ...payload.new,
                // preserve joined relations
                vehicle: prev.vehicle,
                driver: prev.driver,
                route: prev.route,
              } as ActiveTripWithDetails;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [trip?.id]);

    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const displayTrip = liveTrip || trip;

    if (!displayTrip) return null;

    const routeColor = displayTrip.route?.color || '#FFB800';
    const isStale = displayTrip.last_updated ? isLocationStale(displayTrip.last_updated) : false;
    const lastUpdated = displayTrip.last_updated ? getTimeAgo(displayTrip.last_updated) : 'Unknown';
    const passengerCount = displayTrip.passenger_count || 0;
    const maxCapacity = displayTrip.vehicle?.capacity || 20;
    const availableSeats = Math.max(0, maxCapacity - passengerCount);

    // seat availability indicator
    const getSeatStatus = () => {
      const fillPercentage = passengerCount / maxCapacity;
      if (fillPercentage >= 1) {
        return { label: 'Full', color: theme.colors.error };
      }
      if (fillPercentage >= 0.8) {
        return { label: 'Almost Full', color: '#FF9800' };
      }
      if (fillPercentage >= 0.5) {
        return { label: 'Filling Up', color: '#FFC107' };
      }
      return { label: 'Available', color: theme.colors.primary };
    };

    const seatStatus = getSeatStatus();

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      >
        <BottomSheetView style={styles.content}>
          {/* header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.routeIndicator, { backgroundColor: routeColor }]} />
              <View>
                <Text variant="titleMedium" style={styles.routeName}>
                  {displayTrip.route?.name || 'Unknown Route'}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {displayTrip.vehicle?.plate_number || 'No plate'}
                </Text>
              </View>
            </View>
            <IconButton icon="close" size={20} onPress={handleClose} />
          </View>

          <Divider style={styles.divider} />

          {/* seat availability */}
          <View style={styles.section}>
            <View style={styles.seatRow}>
              <View style={styles.seatInfo}>
                <Text variant="headlineMedium" style={{ color: seatStatus.color }}>
                  {availableSeats}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  seats available
                </Text>
              </View>
              <Chip
                mode="flat"
                style={[styles.seatChip, { backgroundColor: seatStatus.color + '20' }]}
                textStyle={{ color: seatStatus.color, fontSize: 12 }}
              >
                {seatStatus.label}
              </Chip>
            </View>

            {/* capacity bar */}
            <View style={styles.capacityBar}>
              <View
                style={[
                  styles.capacityFill,
                  {
                    backgroundColor: seatStatus.color,
                    width: `${Math.min(100, (passengerCount / maxCapacity) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text variant="bodySmall" style={styles.capacityText}>
              {passengerCount} / {maxCapacity} passengers
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* status info */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Last Updated
              </Text>
              <View style={styles.statusValue}>
                <View
                  style={[styles.statusDot, { backgroundColor: isStale ? '#FF5722' : '#4CAF50' }]}
                />
                <Text variant="bodyMedium">{lastUpdated}</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Driver
              </Text>
              <Text variant="bodyMedium">{displayTrip.driver?.display_name || 'Unknown'}</Text>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  routeName: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
  },
  section: {
    marginBottom: 4,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  seatChip: {
    height: 28,
  },
  capacityBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityText: {
    marginTop: 4,
    color: '#757575',
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
