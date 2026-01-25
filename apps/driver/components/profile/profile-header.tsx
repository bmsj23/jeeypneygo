import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatCard } from '@jeepneygo/ui';

interface ProfileHeaderProps {
  user: {
    avatar_url?: string | null;
    display_name?: string | null;
    phone?: string | null;
    email?: string | null;
    is_approved?: boolean;
  } | null;
  driverRating: number;
}

interface ProfileStatsProps {
  isLoading: boolean;
  totalTrips: number;
  totalPassengers: number;
  totalHours: number;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader({ user, driverRating }: ProfileHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.profileTop}>
      {user?.avatar_url ? (
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>{getInitials(user?.display_name || 'D')}</Text>
        </View>
      )}
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
          {user?.display_name || 'Driver'}
        </Text>
        <Text style={[styles.profilePhone, { color: theme.colors.onSurfaceVariant }]}>
          {user?.phone || user?.email || 'No contact info'}
        </Text>
        <View style={styles.ratingContainer}>
          <MaterialCommunityIcons name="star" size={16} color="#FFB800" />
          <Text style={[styles.ratingText, { color: theme.colors.onSurface }]}>
            {driverRating.toFixed(1)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: user?.is_approved ? '#E8F5E9' : theme.colors.primaryContainer },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: user?.is_approved ? '#4CAF50' : theme.colors.primary },
              ]}
            >
              {user?.is_approved ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ProfileStats({ isLoading, totalTrips, totalPassengers, totalHours }: ProfileStatsProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={styles.statsLoading}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.statsRow}>
      <StatCard
        icon="steering"
        value={totalTrips}
        label="Trips"
        iconColor={theme.colors.primary}
        size="small"
      />
      <View style={{ width: 8 }} />
      <StatCard
        icon="account-group"
        value={totalPassengers}
        label="Passengers"
        iconColor="#4CAF50"
        size="small"
      />
      <View style={{ width: 8 }} />
      <StatCard
        icon="clock-outline"
        value={`${totalHours}h`}
        label="Online"
        iconColor="#FF9800"
        size="small"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: '700',
  },
  profilePhone: {
    fontSize: 14,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsLoading: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
