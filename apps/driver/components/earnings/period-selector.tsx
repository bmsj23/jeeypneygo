import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export type TimePeriod = 'today' | 'week' | 'month' | 'all';

interface PeriodSelectorProps {
  selected: TimePeriod;
  onSelect: (period: TimePeriod) => void;
}

const options: { key: TimePeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'all', label: 'All' },
];

export function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <Pressable
          key={option.key}
          onPress={() => onSelect(option.key)}
          style={[
            styles.button,
            {
              backgroundColor: selected === option.key ? theme.colors.primary : theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: selected === option.key ? '#1A1A2E' : theme.colors.onSurfaceVariant,
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
