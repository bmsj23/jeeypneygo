import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

interface DateFilterChipsProps {
  selected: DateFilter;
  onSelect: (filter: DateFilter) => void;
}

const filterOptions: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export function DateFilterChips({ selected, onSelect }: DateFilterChipsProps) {
  const theme = useTheme();

  return (
    <View style={styles.filterRow}>
      {filterOptions.map((option) => (
        <Pressable
          key={option.key}
          onPress={() => onSelect(option.key)}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                selected === option.key ? theme.colors.primary : theme.colors.surfaceVariant,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              {
                color: selected === option.key ? '#1A237E' : theme.colors.onSurfaceVariant,
                fontWeight: selected === option.key ? '600' : '500',
              },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function getFilterLabel(filter: DateFilter): string {
  return filterOptions.find((f) => f.key === filter)?.label || 'All Trips';
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
  },
});
