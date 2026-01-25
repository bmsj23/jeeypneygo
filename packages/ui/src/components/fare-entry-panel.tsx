import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

const FARE_AMOUNTS = [1, 5, 10, 20, 50];

const COLORS = {
  primary: '#FFB800',
  primaryDark: '#F59E0B',
  success: '#16A34A',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  surface: '#F8F9FA',
  background: '#FFFFFF',
  border: '#E5E7EB',
};

export interface FareEntryPanelProps {
  totalFare: number;
  passengerCount: number;
  onAddFare: (amount: number) => void;
  onUndo: () => void;
  onDecrementPassenger?: () => void;
  canUndo: boolean;
  disabled?: boolean;
  onModeChange?: (isEnteringFare: boolean) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FareEntryPanel({
  totalFare,
  passengerCount,
  onAddFare,
  onUndo,
  onDecrementPassenger,
  canUndo,
  disabled = false,
  onModeChange,
}: FareEntryPanelProps) {
  const [isEnteringFare, setIsEnteringFare] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);
  const totalScale = useSharedValue(1);

  const totalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: totalScale.value }],
  }));

  const handleAmountPress = (amount: number) => {
    if (disabled) return;
    setCurrentAmount((prev) => prev + amount);
  };

  const handleClear = () => {
    setCurrentAmount(0);
  };

  const handleFinish = () => {
    if (currentAmount > 0) {
      totalScale.value = withSequence(
        withSpring(1.08, { damping: 15 }),
        withSpring(1, { damping: 15 })
      );
      onAddFare(currentAmount);
      setCurrentAmount(0);
      setIsEnteringFare(false);
      onModeChange?.(false);
    }
  };

  const handleStartEntry = () => {
    setIsEnteringFare(true);
    setCurrentAmount(0);
    onModeChange?.(true);
  };

  const handleCancel = () => {
    setIsEnteringFare(false);
    setCurrentAmount(0);
    onModeChange?.(false);
  };

  if (isEnteringFare) {
    return (
      <View style={styles.container}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>Add Passenger Fare</Text>
          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        <Animated.View style={[styles.currentAmountContainer]} entering={FadeIn.duration(200)}>
          <Text style={styles.currentAmountLabel}>Current Fare</Text>
          <Text style={styles.currentAmount}>₱{currentAmount}</Text>
        </Animated.View>

        <View style={styles.amountButtonsRow}>
          {FARE_AMOUNTS.map((amount) => (
            <Pressable
              key={amount}
              style={[styles.amountButton, disabled && styles.buttonDisabled]}
              onPress={() => handleAmountPress(amount)}
              disabled={disabled}
            >
              <Text style={styles.amountButtonText}>+₱{amount}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.entryActions}>
          {currentAmount > 0 && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.clearButtonWrapper}>
              <Pressable onPress={handleClear} style={styles.clearButton}>
                <MaterialCommunityIcons name="refresh" size={18} color={COLORS.textSecondary} />
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>
            </Animated.View>
          )}
          <Pressable
            style={[
              styles.finishButton,
              currentAmount === 0 && styles.finishButtonDisabled,
            ]}
            onPress={handleFinish}
            disabled={currentAmount === 0 || disabled}
          >
            <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.finishButtonText}>Add Passenger</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Fare</Text>
          <Animated.Text style={[styles.summaryValue, totalStyle]}>₱{totalFare.toFixed(0)}</Animated.Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Passengers</Text>
          <Text style={styles.summaryValue}>{passengerCount}</Text>
        </View>
      </View>

      <View style={styles.idleActions}>
        {passengerCount > 0 && onDecrementPassenger && (
          <Pressable
            style={[styles.decrementButton, disabled && styles.buttonDisabled]}
            onPress={onDecrementPassenger}
            disabled={disabled}
          >
            <MaterialCommunityIcons name="account-minus" size={20} color={COLORS.textSecondary} />
          </Pressable>
        )}

        <AnimatedPressable
          style={[styles.addPassengerButton, disabled && styles.buttonDisabled]}
          onPress={handleStartEntry}
          disabled={disabled}
        >
          <MaterialCommunityIcons name="account-plus" size={22} color="#FFFFFF" />
          <Text style={styles.addPassengerText}>Add Passenger</Text>
        </AnimatedPressable>

        {canUndo && (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
            <Pressable
              style={[styles.undoButton, disabled && styles.buttonDisabled]}
              onPress={onUndo}
              disabled={disabled}
            >
              <MaterialCommunityIcons name="undo" size={18} color={COLORS.primaryDark} />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cancelButton: {
    padding: 4,
  },
  currentAmountContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
  },
  currentAmountLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  amountButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  amountButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amountButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  clearButtonWrapper: {
    flex: 0,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.success,
  },
  finishButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  finishButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  idleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addPassengerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  addPassengerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  decrementButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: `${COLORS.primaryDark}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
