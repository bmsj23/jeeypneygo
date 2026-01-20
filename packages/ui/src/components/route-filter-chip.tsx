import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface RouteFilterChipProps {
  name: string;
  shortName?: string;
  color: string;
  isSelected: boolean;
  activeCount?: number;
  onPress: () => void;
}

export function RouteFilterChip({
  name,
  shortName,
  color,
  isSelected,
  activeCount,
  onPress,
}: RouteFilterChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? color : theme.colors.surface,
          borderColor: isSelected ? color : theme.colors.outlineVariant,
        },
      ]}
    >
      {!isSelected && <View style={[styles.colorDot, { backgroundColor: color }]} />}
      <Text
        style={[
          styles.chipText,
          { color: isSelected ? '#FFFFFF' : theme.colors.onSurface },
        ]}
        numberOfLines={1}
      >
        {shortName || name}
      </Text>
      {activeCount !== undefined && activeCount > 0 && (
        <View
          style={[
            styles.countBadge,
            { backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : color + '20' },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: isSelected ? '#FFFFFF' : color },
            ]}
          >
            {activeCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export interface RouteFilterBarProps {
  children: React.ReactNode;
  showAllOption?: boolean;
  isAllSelected?: boolean;
  onAllPress?: () => void;
}

export function RouteFilterBar({
  children,
  showAllOption = true,
  isAllSelected = false,
  onAllPress,
}: RouteFilterBarProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {showAllOption && onAllPress && (
        <Pressable
          onPress={onAllPress}
          style={[
            styles.allChip,
            {
              backgroundColor: isAllSelected ? theme.colors.primary : theme.colors.surface,
              borderColor: isAllSelected ? theme.colors.primary : theme.colors.outlineVariant,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="bus-multiple"
            size={18}
            color={isAllSelected ? '#FFFFFF' : theme.colors.onSurface}
          />
          <Text
            style={[
              styles.chipText,
              { color: isAllSelected ? '#FFFFFF' : theme.colors.onSurface },
            ]}
          >
            All
          </Text>
        </Pressable>
      )}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  allChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
