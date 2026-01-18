import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer, Card, Button } from '@jeepneygo/ui';
import { useAuthStore, useFavorites, type Route } from '@jeepneygo/core';

export default function FavoritesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { favorites, isLoading, removeFavorite } = useFavorites();

  const handleStopPress = (stopId: string, stopName: string) => {
    router.push({
      pathname: '/stop-details' as any,
      params: { stopId, stopName },
    });
  };

  const handleRemoveFavorite = async (stopId: string) => {
    await removeFavorite(stopId);
  };

  const renderEmptyState = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="account-off" size={48} iconColor={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Sign in to save favorites
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}
          >
            Create an account to save your favorite stops for quick access
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInButton}
          >
            Sign In
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <IconButton icon="heart-outline" size={48} iconColor={theme.colors.onSurfaceVariant} />
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          No favorites yet
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}
        >
          Tap the heart icon on any stop to add it to your favorites
        </Text>
      </View>
    );
  };

  const renderFavoriteItem = ({ item }: { item: typeof favorites[0] }) => {
    const stop = item.stop;
    const route = stop?.route as Route | undefined;

    return (
      <TouchableOpacity
        onPress={() => handleStopPress(stop.id, stop.name)}
        activeOpacity={0.7}
      >
        <Card style={styles.favoriteCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.routeIndicator,
                  { backgroundColor: route?.color || '#FFB800' },
                ]}
              />
              <View style={styles.stopInfo}>
                <Text variant="titleMedium" style={styles.stopName}>
                  {stop.name}
                </Text>
                {route && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {route.name} ({route.short_name})
                  </Text>
                )}
                {stop.landmark && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Near {stop.landmark}
                  </Text>
                )}
              </View>
            </View>
            <IconButton
              icon="heart"
              iconColor={theme.colors.error}
              size={20}
              onPress={() => handleRemoveFavorite(stop.id)}
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading && isAuthenticated) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Favorite Stops
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Quick access to your saved stops
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Favorite Stops
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Quick access to your saved stops
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={favorites.length === 0 ? styles.emptyContainer : styles.list}
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
  favoriteCard: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: 12,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  signInButton: {
    marginTop: 24,
  },
});
