import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function QuickActionsRow() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.quickActionsRow}>
      <Pressable
        onPress={() => router.push('/history')}
        style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
          <MaterialCommunityIcons name="history" size={24} color="#1976D2" />
        </View>
        <Text style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>History</Text>
        <Text style={[styles.quickActionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          View past trips
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/(main)/profile')}
        style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
          <MaterialCommunityIcons name="account-cog" size={24} color="#F57C00" />
        </View>
        <Text style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>Settings</Text>
        <Text style={[styles.quickActionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Manage profile
        </Text>
      </Pressable>
    </View>
  );
}

export function VehicleCard() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/vehicle-info')}
      style={[styles.vehicleCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.vehicleIcon, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="bus" size={28} color={theme.colors.primary} />
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={[styles.vehicleTitle, { color: theme.colors.onSurface }]}>Your Vehicle</Text>
        <Text style={[styles.vehiclePlate, { color: theme.colors.onSurfaceVariant }]}>
          Tap to view details
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 13,
  },
});
