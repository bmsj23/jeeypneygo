import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SignOutButtonProps {
  onSignOut: () => void;
}

export function SignOutButton({ onSignOut }: SignOutButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onSignOut}
      style={({ pressed }) => [
        styles.signOutButton,
        {
          backgroundColor: pressed ? '#FFEBEE' : theme.colors.surface,
          borderColor: '#F44336',
        },
      ]}
    >
      <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
      <Text style={styles.signOutText}>Sign Out</Text>
    </Pressable>
  );
}

export function AppVersion() {
  const theme = useTheme();

  return (
    <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
      JeepneyGo Driver v1.7.0
    </Text>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F44336',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 20,
  },
});
