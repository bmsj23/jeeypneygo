import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PassengerStepperProps {
  value: number;
  maxValue?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

export function PassengerStepper({
  value,
  maxValue = 20,
  onIncrement,
  onDecrement,
  disabled = false,
}: PassengerStepperProps) {
  const theme = useTheme();

  const canDecrement = value > 0 && !disabled;
  const canIncrement = value < maxValue && !disabled;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrement}
        disabled={!canDecrement}
        style={({ pressed }) => [
          styles.button,
          styles.decrementButton,
          {
            backgroundColor: canDecrement ? theme.colors.error : theme.colors.surfaceVariant,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="minus"
          size={32}
          color={canDecrement ? '#FFFFFF' : theme.colors.onSurfaceVariant}
        />
      </Pressable>

      <View style={[styles.valueContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.valueLabel, { color: theme.colors.onSurfaceVariant }]}>PASSENGERS</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>{value}</Text>
        <Text style={[styles.maxLabel, { color: theme.colors.onSurfaceVariant }]}>of {maxValue}</Text>
      </View>

      <Pressable
        onPress={onIncrement}
        disabled={!canIncrement}
        style={({ pressed }) => [
          styles.button,
          styles.incrementButton,
          {
            backgroundColor: canIncrement ? theme.colors.primary : theme.colors.surfaceVariant,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="plus"
          size={32}
          color={canIncrement ? '#000000' : theme.colors.onSurfaceVariant}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  decrementButton: {},
  incrementButton: {},
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 100,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  maxLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
