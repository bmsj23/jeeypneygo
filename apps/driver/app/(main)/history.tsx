import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { ScreenContainer, Card } from '@jeepneygo/ui';
import { useAuthStore, useTripHistory } from '@jeepneygo/core';

export default function HistoryScreen() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const { trips, isLoading, refetch } = useTripHistory({
    driverId: user?.id,
    limit: 50,
    includeRoute: true,
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (startedAt: string, endedAt: string): string => {
    const start = new Date(startedAt).getTime();
    const end = new Date(endedAt).getTime();
    const seconds = Math.floor((end - start) / 1000);
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        No trips yet
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
        Your completed trips will appear here
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Loading trip history...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Trip History
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {trips.length} completed trip{trips.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <Card style={styles.tripCard}>
            <Card.Content>
              <View style={styles.tripHeader}>
                <View style={styles.routeInfo}>
                  {item.route && (
                    <View style={[styles.routeColor, { backgroundColor: item.route.color }]} />
                  )}
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.route?.short_name || 'Unknown Route'}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatDate(item.ended_at)}
                </Text>
              </View>
              
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                {item.route?.name}
              </Text>
              
              <View style={styles.tripStats}>
                <View style={styles.tripStat}>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {formatDuration(item.started_at, item.ended_at)}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Duration
                  </Text>
                </View>
                <View style={styles.tripStat}>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {item.total_passengers}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Passengers
                  </Text>
                </View>
                <View style={styles.tripStat}>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {formatTime(item.started_at)}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Started
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.listContent}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  tripCard: {
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeColor: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tripStat: {
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
