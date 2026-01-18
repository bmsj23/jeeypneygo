import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type StatusType = 'active' | 'paused' | 'completed' | 'pending' | 'offline';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
}

const statusConfig: Record<StatusType, { color: string; backgroundColor: string; label: string }> = {
  active: { color: '#1B5E20', backgroundColor: '#C8E6C9', label: 'Active' },
  paused: { color: '#E65100', backgroundColor: '#FFE0B2', label: 'Paused' },
  completed: { color: '#1A237E', backgroundColor: '#E8EAF6', label: 'Completed' },
  pending: { color: '#F57F17', backgroundColor: '#FFF9C4', label: 'Pending' },
  offline: { color: '#616161', backgroundColor: '#EEEEEE', label: 'Offline' },
};

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.backgroundColor },
        size === 'small' && styles.small,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.label,
          { color: config.color },
          size === 'small' && styles.smallLabel,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  smallLabel: {
    fontSize: 12,
  },
});
