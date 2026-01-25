import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SectionHeader, StopCard, EmptyState } from '@jeepneygo/ui';
import type { Stop } from '@jeepneygo/core';

interface StopsListProps {
  stops: Stop[] | undefined;
  routeName: string;
  routeColor: string;
  isAuthenticated: boolean;
  isFavorite: (stopId: string) => boolean;
  onStopPress: (stop: Stop) => void;
  onFavoriteToggle: (stopId: string) => void;
}

export function StopsList({
  stops,
  routeName,
  routeColor,
  isAuthenticated,
  isFavorite,
  onStopPress,
  onFavoriteToggle,
}: StopsListProps) {
  return (
    <View style={styles.stopsContainer}>
      <SectionHeader title="Route Stops" subtitle="Tap a stop for details" />
      {stops?.map((stop, index) => (
        <View key={stop.id} style={styles.stopWrapper}>
          {index > 0 && (
            <View style={[styles.connectorLine, { backgroundColor: routeColor }]} />
          )}
          <StopCard
            name={stop.name}
            routeName={routeName}
            routeColor={routeColor}
            isFavorite={isFavorite(stop.id)}
            onPress={() => onStopPress(stop)}
            onFavoriteToggle={isAuthenticated ? () => onFavoriteToggle(stop.id) : undefined}
          />
        </View>
      ))}
      {(!stops || stops.length === 0) && (
        <EmptyState
          type="no-stops"
          title="No stops available"
          description="Stop information for this route is not yet available."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stopsContainer: {
    paddingHorizontal: 20,
  },
  stopWrapper: {
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    left: 18,
    top: -6,
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
});
