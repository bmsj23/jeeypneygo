import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ProfileHeaderProps {
  user: {
    avatar_url?: string | null;
    display_name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  paddingTop: number;
}

interface ProfileStatsProps {
  isLoading: boolean;
  favoritesCount: number;
  tripsCount: number;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader({ user, paddingTop }: ProfileHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.headerContainer, { paddingTop: paddingTop + 16 }]}>
      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>{getInitials(user?.display_name || 'C')}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
              {user?.display_name || 'Commuter'}
            </Text>
            <Text style={[styles.profileContact, { color: theme.colors.onSurfaceVariant }]}>
              {user?.email || user?.phone || 'No contact info'}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.memberBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons name="account-check" size={14} color={theme.colors.primary} />
                <Text style={[styles.memberText, { color: theme.colors.primary }]}>Member</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ProfileStats({ isLoading, favoritesCount, tripsCount }: ProfileStatsProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={styles.statsLoading}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: '#E91E6315' }]}>
          <MaterialCommunityIcons name="heart" size={20} color="#E91E63" />
        </View>
        <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{favoritesCount}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Favorites</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
      <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: '#4CAF5015' }]}>
          <MaterialCommunityIcons name="bus" size={20} color="#4CAF50" />
        </View>
        <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{tripsCount}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Trips Taken</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
      <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: '#2196F315' }]}>
          <MaterialCommunityIcons name="star" size={20} color="#2196F3" />
        </View>
        <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>New</Text>
        <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Status</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A237E',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileContact: {
    fontSize: 14,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  memberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 60,
    alignSelf: 'center',
  },
  statsLoading: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
});
