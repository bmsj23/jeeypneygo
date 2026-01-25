import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VehicleEmptyStateProps {
  onContactSupport: () => void;
}

export function VehicleEmptyState({ onContactSupport }: VehicleEmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="bus-alert" size={48} color={theme.colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No Vehicle Assigned
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        You don't have a vehicle assigned to your account yet. Please contact your operator to get assigned to a vehicle.
      </Text>
      <Pressable
        onPress={onContactSupport}
        style={({ pressed }) => [
          styles.contactButton,
          { backgroundColor: pressed ? '#E5A700' : theme.colors.primary },
        ]}
      >
        <MaterialCommunityIcons name="message-text-outline" size={20} color="#1A237E" />
        <Text style={styles.contactButtonText}>Contact Support</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A237E',
  },
});