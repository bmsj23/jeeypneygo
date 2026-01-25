import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VehicleInfoNoticeProps {
  onRequestChange: () => void;
}

export function VehicleInfoNotice({ onRequestChange }: VehicleInfoNoticeProps) {
  const theme = useTheme();

  return (
    <View>
      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information-outline" size={20} color="#F57C00" />
        <Text style={styles.infoText}>
          Vehicle information is managed by your operator. Contact support if you need to make changes.
        </Text>
      </View>

      <Pressable
        onPress={onRequestChange}
        style={({ pressed }) => [
          styles.requestButton,
          {
            backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        <MaterialCommunityIcons name="swap-horizontal" size={20} color={theme.colors.primary} />
        <Text style={[styles.requestButtonText, { color: theme.colors.primary }]}>
          Request Vehicle Change
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    backgroundColor: '#FFF3E0',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});