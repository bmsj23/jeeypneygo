import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WelcomeHeaderProps {
  user: {
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.greeting, { color: theme.colors.onSurfaceVariant }]}>{getGreeting()}</Text>
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>
          {user?.display_name || 'Driver'}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push('/(main)/profile')}
        style={[styles.profileButton, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.profileImage} />
        ) : (
          <MaterialCommunityIcons name="account" size={24} color={theme.colors.onSurfaceVariant} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
