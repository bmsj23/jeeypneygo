import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RouteCardProps {
  name: string;
  shortName: string;
  color: string;
  operatingHours: string;
  baseFare: number;
  onPress: () => void;
  isSelected?: boolean;
  isLoading?: boolean;
}

export function RouteCard({
  name,
  shortName,
  color,
  operatingHours,
  baseFare,
  onPress,
  isSelected = false,
  isLoading = false,
}: RouteCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isSelected ? color : theme.colors.surface,
          borderColor: isSelected ? color : theme.colors.outlineVariant,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* route color indicator */}
      <View style={[styles.colorBar, { backgroundColor: isSelected ? '#FFFFFF' : color }]} />

      <View style={styles.content}>
        {/* short name badge */}
        <View style={[styles.shortNameBadge, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${color}20` }]}>
          <Text style={[styles.shortName, { color: isSelected ? '#FFFFFF' : color }]}>{shortName}</Text>
        </View>

        {/* route name */}
        <Text
          style={[styles.name, { color: isSelected ? '#FFFFFF' : theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {name}
        </Text>

        {/* details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={isSelected ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.detailText, { color: isSelected ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant }]}>
              {operatingHours}
            </Text>
          </View>

          <View style={styles.detail}>
            <MaterialCommunityIcons
              name="currency-php"
              size={14}
              color={isSelected ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.detailText, { color: isSelected ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant }]}>
              {baseFare.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* selection indicator */}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  shortNameBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  shortName: {
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
