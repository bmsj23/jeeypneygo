import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCardProps {
  icon: IconName;
  value: string | number;
  label: string;
  iconColor?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function StatCard({
  icon,
  value,
  label,
  iconColor,
  onPress,
  size = 'medium',
}: StatCardProps) {
  const theme = useTheme();
  const effectiveIconColor = iconColor || theme.colors.primary;

  const sizeStyles = {
    small: { padding: 12, iconSize: 20, valueSize: 18, labelSize: 10 },
    medium: { padding: 16, iconSize: 24, valueSize: 24, labelSize: 11 },
    large: { padding: 20, iconSize: 28, valueSize: 32, labelSize: 12 },
  };

  const s = sizeStyles[size];

  const content = (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, padding: s.padding }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${effectiveIconColor}15` }]}>
        <MaterialCommunityIcons name={icon} size={s.iconSize} color={effectiveIconColor} />
      </View>
      <Text style={[styles.value, { color: theme.colors.onSurface, fontSize: s.valueSize }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant, fontSize: s.labelSize }]}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
