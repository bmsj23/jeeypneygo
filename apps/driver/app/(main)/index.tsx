import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer, Card } from '@jeepneygo/ui';
import { useAuthStore, useTodayStats, useTripStore } from '@jeepneygo/core';

export default function DriverHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const activeTrip = useTripStore((state) => state.activeTrip);
  
  const { tripsToday, passengersToday, hoursOnline, isLoading, refetch } = useTodayStats(user?.id);

  // refetch stats when returning to this screen
  useEffect(() => {
    refetch();
  }, []);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  const handleStartTrip = () => {
    router.push('/(main)/trip');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.greeting}>
          {getGreeting()}
        </Text>
        <Text variant="headlineSmall" style={styles.name}>
          {user?.display_name || 'Driver'}
        </Text>
      </View>

      {activeTrip && (
        <Card style={{ ...styles.activeTripBanner, backgroundColor: theme.colors.primaryContainer }} onPress={handleStartTrip}>
          <Card.Content style={styles.activeTripContent}>
            <View style={styles.activeTripInfo}>
              <View style={[styles.activeDot, { backgroundColor: '#4CAF50' }]} />
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                Trip in Progress
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
              Tap to view
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text variant="headlineLarge" style={[styles.statValue, { color: theme.colors.primary }]}>
                {tripsToday}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.statLabel}>
              Trips Today
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text variant="headlineLarge" style={[styles.statValue, { color: theme.colors.primary }]}>
                {hoursOnline}h
              </Text>
            )}
            <Text variant="bodySmall" style={styles.statLabel}>
              Time Online
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text variant="headlineLarge" style={[styles.statValue, { color: theme.colors.primary }]}>
                {passengersToday}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.statLabel}>
              Passengers
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.actionSection}>
        <Button
          mode="contained"
          size="large"
          fullWidth
          onPress={handleStartTrip}
          icon={activeTrip ? 'arrow-right' : 'play'}
          style={styles.startButton}
        >
          {activeTrip ? 'Continue Trip' : 'Start New Trip'}
        </Button>

        <Text variant="bodySmall" style={styles.hint}>
          {activeTrip ? 'You have an active trip' : 'Select your route and start tracking'}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <View style={styles.quickActionRow}>
          <Card style={styles.quickActionCard} onPress={() => router.push('/(main)/history')}>
            <Card.Content style={styles.quickActionContent}>
              <Text variant="titleMedium">View History</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                See past trips
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.quickActionCard} onPress={() => router.push('/(main)/profile')}>
            <Card.Content style={styles.quickActionContent}>
              <Text variant="titleMedium">Profile</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Update your info
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  greeting: {
    color: '#757575',
  },
  name: {
    fontWeight: 'bold',
    color: '#1A237E',
  },
  activeTripBanner: {
    marginBottom: 16,
  },
  activeTripContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeTripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#757575',
    marginTop: 4,
  },
  actionSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  startButton: {
    marginBottom: 12,
  },
  hint: {
    color: '#757575',
  },
  quickActions: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#212121',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
  },
  quickActionContent: {
    paddingVertical: 8,
  },
});
