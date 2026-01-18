import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Card } from '@jeepneygo/ui';
import {
  useRoutes,
  useActiveTrips,
  useFavorites,
  useAuthStore,
  formatFare,
  type RouteWithStops,
  type Stop,
} from '@jeepneygo/core';

export default function RouteDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routeId, routeName } = useLocalSearchParams<{ routeId: string; routeName: string }>();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { routes, isLoading: routesLoading } = useRoutes({ includeStops: true });
  const { trips } = useActiveTrips(routeId);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // find the selected route
  const route = useMemo(() => {
    return routes.find((r) => r.id === routeId) as RouteWithStops | undefined;
  }, [routes, routeId]);

  const handleStopPress = (stop: Stop) => {
    router.push({
      pathname: '/stop-details' as any,
      params: { stopId: stop.id, stopName: stop.name },
    });
  };

  const handleFavoriteToggle = async (stopId: string) => {
    if (isFavorite(stopId)) {
      await removeFavorite(stopId);
    } else {
      await addFavorite(stopId);
    }
  };

  const renderStopItem = ({ item, index }: { item: Stop; index: number }) => {
    const isFav = isFavorite(item.id);

    return (
      <TouchableOpacity onPress={() => handleStopPress(item)} activeOpacity={0.7}>
        <View style={styles.stopItem}>
          <View style={styles.stopLeft}>
            {/* stop indicator with line */}
            <View style={styles.stopIndicatorContainer}>
              {index > 0 && (
                <View style={[styles.stopLine, { backgroundColor: route?.color || '#FFB800' }]} />
              )}
              <View style={[styles.stopDot, { backgroundColor: route?.color || '#FFB800' }]} />
              {index < (route?.stops?.length || 0) - 1 && (
                <View style={[styles.stopLineBottom, { backgroundColor: route?.color || '#FFB800' }]} />
              )}
            </View>

            <View style={styles.stopInfo}>
              <Text variant="bodyLarge" style={styles.stopName}>
                {item.name}
              </Text>
              {item.landmark && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Near {item.landmark}
                </Text>
              )}
            </View>
          </View>

          {isAuthenticated && (
            <IconButton
              icon={isFav ? 'heart' : 'heart-outline'}
              iconColor={isFav ? theme.colors.error : theme.colors.onSurfaceVariant}
              size={20}
              onPress={() => handleFavoriteToggle(item.id)}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (routesLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!route) {
    return (
      <ScreenContainer>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Route Not Found
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const routeColor = route.color || '#FFB800';

  return (
    <ScreenContainer scrollable>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <View style={styles.headerContent}>
          <Text variant="titleLarge" style={styles.headerTitle} numberOfLines={1}>
            {routeName || route.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {route.short_name}
          </Text>
        </View>
        <View style={[styles.routeColorBadge, { backgroundColor: routeColor }]} />
      </View>

      <Divider />

      {/* route info card */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text variant="headlineMedium" style={{ color: routeColor }}>
              {trips.length}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Active Jeepneys
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              {route.stops?.length || 0}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Stops
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.fareSection}>
          <Text variant="titleSmall" style={styles.sectionLabel}>
            Fare Information
          </Text>
          <View style={styles.fareRow}>
            <Chip mode="outlined" style={styles.fareChip}>
              Base: {formatFare(route.base_fare || 13)}
            </Chip>
            <Chip mode="outlined" style={styles.fareChip}>
              +{formatFare(route.per_km_rate || 1.8)}/km
            </Chip>
          </View>
          <Text variant="bodySmall" style={styles.discountNote}>
            20% discount for students, seniors, and PWD
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.hoursSection}>
          <Text variant="titleSmall" style={styles.sectionLabel}>
            Operating Hours
          </Text>
          <Text variant="bodyMedium">{route.operating_start && route.operating_end ? `${route.operating_start} - ${route.operating_end}` : '5:00 AM - 9:00 PM'}</Text>
        </View>
      </Card>

      {/* stops list */}
      <View style={styles.stopsSection}>
        <Text variant="titleMedium" style={styles.stopsTitle}>
          Route Stops
        </Text>

        <FlatList
          data={route.stops}
          keyExtractor={(item) => item.id}
          renderItem={renderStopItem}
          scrollEnabled={false}
          contentContainerStyle={styles.stopsList}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1A237E',
  },
  routeColorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    margin: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  fareSection: {
    gap: 8,
  },
  sectionLabel: {
    color: '#757575',
    marginBottom: 4,
  },
  fareRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fareChip: {
    height: 32,
  },
  discountNote: {
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 4,
  },
  hoursSection: {
    gap: 4,
  },
  stopsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  stopsTitle: {
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 16,
  },
  stopsList: {
    paddingBottom: 16,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  stopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stopIndicatorContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  stopLine: {
    position: 'absolute',
    top: -20,
    width: 2,
    height: 20,
  },
  stopLineBottom: {
    position: 'absolute',
    bottom: -20,
    width: 2,
    height: 20,
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontWeight: '500',
  },
});
