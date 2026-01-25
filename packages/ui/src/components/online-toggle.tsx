import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface OnlineToggleProps {
  isOnline: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
}

export function OnlineToggle({
  isOnline,
  onToggle,
  disabled = false,
  label,
}: OnlineToggleProps) {
  const theme = useTheme();

  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isOnline) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isOnline, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const buttonLabel = label || (isOnline ? 'GO OFFLINE' : 'GO ONLINE');

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onToggle}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: isOnline ? theme.colors.error : theme.colors.primary,
              opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name={isOnline ? 'power-off' : 'power'}
            size={28}
            color={isOnline ? '#FFFFFF' : '#000000'}
          />
          <Text style={[styles.label, { color: isOnline ? '#FFFFFF' : '#000000' }]}>
            {buttonLabel}
          </Text>
        </Pressable>
      </Animated.View>

      {isOnline && (
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
            You're online and visible to commuters
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
