import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { RouteCard } from '@jeepneygo/ui';
import type { Route } from '@jeepneygo/core';

interface RouteSelectionProps {
  routes: Route[];
  isLoading: boolean;
  pendingRoute: Route | null;
  isGettingLocation: boolean;
  onSelectRoute: (route: Route) => void;
  onCancel: () => void;
}

export function RouteSelection({
  routes,
  isLoading,
  pendingRoute,
  isGettingLocation,
  onSelectRoute,
  onCancel,
}: RouteSelectionProps) {
  const theme = useTheme();

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Select Your Route</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Choose a route to start your trip
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routeCards}
        >
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              name={route.name}
              shortName={route.short_name}
              color={route.color}
              operatingHours={`${route.operating_start} - ${route.operating_end}`}
              baseFare={route.base_fare}
              onPress={() => onSelectRoute(route)}
              isSelected={pendingRoute?.id === route.id}
              isLoading={isGettingLocation && pendingRoute?.id === route.id}
            />
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={onCancel}
        style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        <Text style={[styles.cancelButtonText, { color: theme.colors.onSurfaceVariant }]}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
  },
  loader: {
    marginTop: 32,
  },
  routeCards: {
    paddingBottom: 16,
    gap: 12,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
