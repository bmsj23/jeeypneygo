import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SectionHeader, JeepneyETACard, EmptyState } from '@jeepneygo/ui';

interface Trip {
  id: string;
  passenger_count: number | null;
  vehicle?: {
    plate_number: string;
    capacity: number;
  } | null;
  driver?: {
    display_name: string | null;
  } | null;
}

interface JeepneysListProps {
  trips: Trip[];
  routeName: string;
  routeColor: string;
}

export function JeepneysList({ trips, routeName, routeColor }: JeepneysListProps) {
  return (
    <View style={styles.jeepneysContainer}>
      <SectionHeader
        title="Active Jeepneys"
        subtitle={trips.length > 0 ? `${trips.length} on this route` : 'No active jeepneys'}
      />
      {trips.length > 0 ? (
        trips.map((trip) => {
          const maxCapacity = trip.vehicle?.capacity || 20;
          const passengerCount = trip.passenger_count || 0;
          const availableSeats = Math.max(0, maxCapacity - passengerCount);

          return (
            <View key={trip.id} style={styles.cardWrapper}>
              <JeepneyETACard
                plateNumber={trip.vehicle?.plate_number || 'Unknown'}
                driverName={trip.driver?.display_name || undefined}
                routeName={routeName}
                routeColor={routeColor}
                etaMinutes={0}
                availableSeats={availableSeats}
                maxSeats={maxCapacity}
              />
            </View>
          );
        })
      ) : (
        <EmptyState
          type="no-trips"
          title="No active jeepneys"
          description="There are no jeepneys currently operating on this route."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  jeepneysContainer: {
    paddingHorizontal: 20,
  },
  cardWrapper: {
    marginBottom: 0,
  },
});
