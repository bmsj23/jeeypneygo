import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type EmptyStateType =
  | 'no-trips'
  | 'no-history'
  | 'no-routes'
  | 'no-favorites'
  | 'no-stops'
  | 'no-results'
  | 'offline'
  | 'error'
  | 'empty';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

// preset configurations for common empty states
const presets: Record<EmptyStateType, { icon: string; title: string; description: string }> = {
  'no-trips': {
    icon: 'bus-clock',
    title: 'No Active Trips',
    description: 'There are no jeepneys currently on this route. Check back in a few minutes.',
  },
  'no-history': {
    icon: 'history',
    title: 'No Trip History',
    description: 'Your completed trips will appear here once you start driving.',
  },
  'no-routes': {
    icon: 'map-marker-path',
    title: 'No Routes Available',
    description: 'Routes are being set up. Please try again later.',
  },
  'no-favorites': {
    icon: 'heart-outline',
    title: 'No Favorites Yet',
    description: 'Save your frequent stops for quick access. Tap the heart icon on any stop to add it here.',
  },
  'no-stops': {
    icon: 'map-marker-off',
    title: 'No Stops Found',
    description: 'No stops match your search. Try a different keyword.',
  },
  'no-results': {
    icon: 'magnify-close',
    title: 'No Results',
    description: 'We could not find anything matching your search. Try different keywords.',
  },
  offline: {
    icon: 'wifi-off',
    title: 'You Are Offline',
    description: 'Check your internet connection and try again.',
  },
  error: {
    icon: 'alert-circle-outline',
    title: 'Something Went Wrong',
    description: 'We encountered an error. Please try again.',
  },
  empty: {
    icon: 'inbox-outline',
    title: 'Nothing Here',
    description: 'This section is empty.',
  },
};

export function EmptyState({
  type = 'empty',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const theme = useTheme();
  const preset = presets[type];

  const displayIcon = icon || preset.icon;
  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons
          name={displayIcon as any}
          size={48}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        {displayTitle}
      </Text>
      <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        {displayDescription}
      </Text>
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.actionButton}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    marginTop: 24,
  },
});

export default EmptyState;
