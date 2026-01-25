import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBarHero, RouteFilterBar, RouteFilterChip } from '@jeepneygo/ui';
import type { Route } from '@jeepneygo/core';

interface MapTopOverlayProps {
  routes: Route[];
  selectedRouteId: string | null;
  tripCount: number;
  routeCounts: Record<string, number>;
  onSearchPress: () => void;
  onRouteFilter: (routeId: string | null) => void;
}

export function MapTopOverlay({
  routes,
  selectedRouteId,
  tripCount,
  routeCounts,
  onSearchPress,
  onRouteFilter,
}: MapTopOverlayProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.topOverlay, { paddingTop: insets.top + 12 }]}>
      <View style={styles.searchHeroContainer}>
        <SearchBarHero onPress={onSearchPress} subtitle={`${tripCount} jeepneys nearby`} />
      </View>

      <RouteFilterBar
        showAllOption
        isAllSelected={selectedRouteId === null}
        onAllPress={() => onRouteFilter(null)}
      >
        {routes.map((route) => (
          <RouteFilterChip
            key={route.id}
            name={route.name}
            shortName={route.short_name}
            color={route.color || '#FFB800'}
            isSelected={selectedRouteId === route.id}
            activeCount={routeCounts[route.id] || 0}
            onPress={() => onRouteFilter(route.id)}
          />
        ))}
      </RouteFilterBar>
    </View>
  );
}

const styles = StyleSheet.create({
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  searchHeroContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
