import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StopCard, SectionHeader, EmptyState, Button } from '@jeepneygo/ui';
import { useAuthStore, useFavorites, type Route } from '@jeepneygo/core';

export default function FavoritesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { favorites, isLoading, removeFavorite } = useFavorites();

  // group favorites by route
  const groupedFavorites = useMemo(() => {
    const groups: Record<string, typeof favorites> = {};
    favorites.forEach(fav => {
      const route = fav.stop?.route as Route | undefined;
      const routeId = route?.id || 'unknown';
      if (!groups[routeId]) {
        groups[routeId] = [];
      }
      groups[routeId].push(fav);
    });
    return groups;
  }, [favorites]);

  const handleStopPress = (stopId: string, stopName: string) => {
    router.push({
      pathname: '/stop-details' as any,
      params: { stopId, stopName },
    });
  };

  const handleRemoveFavorite = async (stopId: string) => {
    await removeFavorite(stopId);
  };

  // sign in required state
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.heroHeader, { paddingTop: insets.top + 16, backgroundColor: '#E91E63' }]}>
          <MaterialCommunityIcons name="heart" size={48} color="rgba(255,255,255,0.9)" />
          <Text style={styles.heroTitle}>Favorites</Text>
          <Text style={styles.heroSubtitle}>Save stops for quick access</Text>
        </View>

        <View style={styles.signInPrompt}>
          <View style={[styles.signInCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialCommunityIcons name="account-heart" size={64} color={theme.colors.primary} />
            <Text style={[styles.signInTitle, { color: theme.colors.onSurface }]}>
              Sign in to save favorites
            </Text>
            <Text style={[styles.signInText, { color: theme.colors.onSurfaceVariant }]}>
              Create an account to save your favorite stops and get quick access when you need it
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(auth)/login')}
              style={styles.signInButton}
            >
              Sign In
            </Button>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.createAccountText, { color: theme.colors.primary }]}>
                Don't have an account? Create one
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.heroHeader, { paddingTop: insets.top + 16, backgroundColor: '#E91E63' }]}>
          <MaterialCommunityIcons name="heart" size={48} color="rgba(255,255,255,0.9)" />
          <Text style={styles.heroTitle}>Favorites</Text>
          <Text style={styles.heroSubtitle}>Loading your saved stops...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  // empty state
  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.heroHeader, { paddingTop: insets.top + 16, backgroundColor: '#E91E63' }]}>
          <MaterialCommunityIcons name="heart" size={48} color="rgba(255,255,255,0.9)" />
          <Text style={styles.heroTitle}>Favorites</Text>
          <Text style={styles.heroSubtitle}>0 saved stops</Text>
        </View>

        <View style={styles.emptyContainer}>
          <EmptyState
            type="no-favorites"
            title="No favorites yet"
            description="Tap the heart icon on any stop to save it here for quick access"
            actionLabel="Browse Routes"
            onAction={() => router.push('/routes')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* hero header */}
      <View style={[styles.heroHeader, { paddingTop: insets.top + 16, backgroundColor: '#E91E63' }]}>
        <MaterialCommunityIcons name="heart" size={48} color="rgba(255,255,255,0.9)" />
        <Text style={styles.heroTitle}>Favorites</Text>
        <Text style={styles.heroSubtitle}>{favorites.length} saved stops</Text>
      </View>

      {/* favorites list */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <SectionHeader
            title="Your Saved Stops"
            subtitle="Tap to view details"
          />
        }
        renderItem={({ item }) => {
          const stop = item.stop;
          const route = stop?.route as Route | undefined;

          return (
            <View style={styles.cardWrapper}>
              <StopCard
                name={stop.name}
                routeName={route?.name}
                routeColor={route?.color}
                isFavorite
                onPress={() => handleStopPress(stop.id, stop.name)}
                onFavoriteToggle={() => handleRemoveFavorite(stop.id)}
              />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  list: {
    paddingBottom: 100,
  },
  cardWrapper: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  signInPrompt: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  signInCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  signInTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  signInText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  signInButton: {
    width: '100%',
    marginBottom: 16,
  },
  createAccountText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
