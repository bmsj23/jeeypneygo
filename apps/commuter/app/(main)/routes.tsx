import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer, Card } from '@jeepneygo/ui';
import { useRoutes, type RouteWithStops } from '@jeepneygo/core';

export default function RoutesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { routes, isLoading, error } = useRoutes({ includeStops: true });

  const handleRoutePress = (route: RouteWithStops) => {
    router.push({
      pathname: '/route-details' as any,
      params: { routeId: route.id, routeName: route.name },
    });
  };

  const renderRoute = ({ item }: { item: RouteWithStops }) => (
    <TouchableOpacity onPress={() => handleRoutePress(item)} activeOpacity={0.7}>
      <Card style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <View style={[styles.routeColor, { backgroundColor: item.color || '#FFB800' }]} />
          <View style={styles.routeInfo}>
            <Text variant="titleMedium" style={styles.routeName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.routeShortName}>
              {item.short_name}
            </Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.routeDetails}>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Operating Hours
            </Text>
            <Text variant="bodySmall" style={styles.detailValue}>
              {item.operating_start && item.operating_end ? `${item.operating_start} - ${item.operating_end}` : '5:00 AM - 9:00 PM'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Base Fare
            </Text>
            <Text variant="bodySmall" style={styles.detailValue}>
              ₱{(item.base_fare || 13).toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Stops
            </Text>
            <Text variant="bodySmall" style={styles.detailValue}>
              {item.stops?.length || 0} stops
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>
            Failed to load routes
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            {error.message}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Jeepney Routes
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          View all available routes in Lipa City
        </Text>
      </View>

      <FlatList
        data={routes as RouteWithStops[]}
        keyExtractor={(item) => item.id}
        renderItem={renderRoute}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#1A237E',
  },
  subtitle: {
    color: '#757575',
    marginTop: 4,
  },
  list: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  routeCard: {
    marginBottom: 16,
    padding: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeColor: {
    width: 8,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontWeight: '600',
    color: '#212121',
  },
  routeShortName: {
    color: '#757575',
    marginTop: 2,
  },
  divider: {
    marginVertical: 12,
  },
  routeDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#757575',
  },
  detailValue: {
    color: '#212121',
    fontWeight: '500',
  },
});
