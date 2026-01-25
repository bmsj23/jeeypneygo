import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Avatar } from 'react-native-paper';

interface ProfileHeaderProps {
  displayName: string;
  email?: string | null;
  phone?: string | null;
  favoritesCount: number;
  paddingTop: number;
}

export function ProfileHeader({
  displayName,
  email,
  phone,
  favoritesCount,
  paddingTop,
}: ProfileHeaderProps) {
  const theme = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[styles.profileHeader, { paddingTop: paddingTop + 24, backgroundColor: theme.colors.primary }]}>
      <Avatar.Text
        size={80}
        label={getInitials(displayName || 'C')}
        style={styles.avatar}
        labelStyle={styles.avatarLabel}
      />
      <Text style={styles.profileName}>{displayName || 'Commuter'}</Text>
      <Text style={styles.profileEmail}>{email || phone || ''}</Text>

      <View style={[styles.statsRow, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#E91E63' }]}>{favoritesCount}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Favorites</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Trips</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>New</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Status</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    position: 'absolute',
    bottom: -30,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    alignSelf: 'center',
  },
});
