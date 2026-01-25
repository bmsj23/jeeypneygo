import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

// ltfrb-compliant fare rates
const REGULAR_FARE = 13;
const DISCOUNTED_FARE = 10;

const COLORS = {
  primary: '#1A237E',
  success: '#16A34A',
  info: '#2563EB',
  warning: '#F59E0B',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  surface: '#F8F9FA',
  background: '#FFFFFF',
  border: '#E5E7EB',
};

export interface FareEntry {
  id: string;
  type: 'regular' | 'discounted';
  amount: number;
  timestamp: number;
}

export interface FareLoggerProps {
  entries: FareEntry[];
  onLogFare: (type: 'regular' | 'discounted') => void;
  onUndoLast: () => void;
  totalFare: number;
  regularCount: number;
  discountedCount: number;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FareLogger({
  entries,
  onLogFare,
  onUndoLast,
  totalFare,
  regularCount,
  discountedCount,
  disabled = false,
}: FareLoggerProps) {
  const regularScale = useSharedValue(1);
  const discountedScale = useSharedValue(1);
  const totalScale = useSharedValue(1);

  const regularButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: regularScale.value }],
  }));

  const discountedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: discountedScale.value }],
  }));

  const totalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: totalScale.value }],
  }));

  const handleRegularPress = () => {
    if (disabled) return;
    regularScale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    totalScale.value = withSequence(
      withSpring(1.05, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    onLogFare('regular');
  };

  const handleDiscountedPress = () => {
    if (disabled) return;
    discountedScale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    totalScale.value = withSequence(
      withSpring(1.05, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    onLogFare('discounted');
  };

  const totalPassengers = regularCount + discountedCount;
  const canUndo = entries.length > 0;

  return (
    <View style={styles.container}>
      {/* total earnings display */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Trip Earnings</Text>
        <Animated.View style={totalStyle}>
          <Text style={styles.totalAmount}>₱{totalFare.toFixed(2)}</Text>
        </Animated.View>
        <View style={styles.passengerSummary}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="account" size={16} color={COLORS.success} />
            <Text style={styles.summaryText}>{regularCount} regular</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="account-star" size={16} color={COLORS.info} />
            <Text style={styles.summaryText}>{discountedCount} discounted</Text>
          </View>
        </View>
      </View>

      {/* fare buttons */}
      <View style={styles.buttonsRow}>
        <AnimatedPressable
          style={[styles.fareButton, styles.regularButton, regularButtonStyle, disabled && styles.buttonDisabled]}
          onPress={handleRegularPress}
          disabled={disabled}
        >
          <View style={styles.fareButtonIcon}>
            <MaterialCommunityIcons name="account-plus" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.fareButtonLabel}>Regular</Text>
          <Text style={[styles.fareButtonAmount, styles.regularAmount]}>+₱{REGULAR_FARE}</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={[styles.fareButton, styles.discountedButton, discountedButtonStyle, disabled && styles.buttonDisabled]}
          onPress={handleDiscountedPress}
          disabled={disabled}
        >
          <View style={styles.fareButtonIcon}>
            <MaterialCommunityIcons name="account-star" size={24} color={COLORS.info} />
          </View>
          <Text style={styles.fareButtonLabel}>Discounted</Text>
          <Text style={[styles.fareButtonAmount, styles.discountedAmount]}>+₱{DISCOUNTED_FARE}</Text>
        </AnimatedPressable>
      </View>

      {/* undo button */}
      {canUndo && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          <Pressable
            style={[styles.undoButton, disabled && styles.buttonDisabled]}
            onPress={onUndoLast}
            disabled={disabled}
          >
            <MaterialCommunityIcons name="undo" size={18} color={COLORS.warning} />
            <Text style={styles.undoText}>
              Undo last ({entries[entries.length - 1]?.type === 'regular' ? '₱13' : '₱10'})
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* info note */}
      <View style={styles.infoNote}>
        <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>
          Tap buttons as passengers board. Discounted fare applies to students, seniors, and PWDs.
        </Text>
      </View>
    </View>
  );
}

export function FareLoggerCompact({
  onLogFare,
  totalFare,
  regularCount,
  discountedCount,
  disabled = false,
}: Omit<FareLoggerProps, 'entries' | 'onUndoLast'>) {
  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactTotal}>
        <Text style={styles.compactTotalLabel}>Fare</Text>
        <Text style={styles.compactTotalAmount}>₱{totalFare.toFixed(2)}</Text>
        <Text style={styles.compactPassengers}>
          {regularCount + discountedCount} passengers
        </Text>
      </View>
      <View style={styles.compactButtons}>
        <Pressable
          style={[styles.compactButton, styles.compactRegular, disabled && styles.buttonDisabled]}
          onPress={() => onLogFare('regular')}
          disabled={disabled}
        >
          <Text style={styles.compactButtonText}>+₱{REGULAR_FARE}</Text>
        </Pressable>
        <Pressable
          style={[styles.compactButton, styles.compactDiscounted, disabled && styles.buttonDisabled]}
          onPress={() => onLogFare('discounted')}
          disabled={disabled}
        >
          <Text style={styles.compactButtonText}>+₱{DISCOUNTED_FARE}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  passengerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fareButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  regularButton: {
    backgroundColor: `${COLORS.success}10`,
    borderColor: `${COLORS.success}30`,
  },
  discountedButton: {
    backgroundColor: `${COLORS.info}10`,
    borderColor: `${COLORS.info}30`,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fareButtonIcon: {
    marginBottom: 6,
  },
  fareButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  fareButtonAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  regularAmount: {
    color: COLORS.success,
  },
  discountedAmount: {
    color: COLORS.info,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: `${COLORS.warning}10`,
    borderRadius: 8,
  },
  undoText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.warning,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  compactTotal: {
    flex: 1,
  },
  compactTotalLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  compactTotalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  compactPassengers: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  compactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  compactButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  compactRegular: {
    backgroundColor: COLORS.success,
  },
  compactDiscounted: {
    backgroundColor: COLORS.info,
  },
  compactButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
