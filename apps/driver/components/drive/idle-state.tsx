import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface IdleStateProps {
  onGoOnline: () => void;
  isPressed: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  hasVehicle: boolean;
  isVehicleLoading: boolean;
}

export function IdleState({
  onGoOnline,
  isPressed,
  onPressIn,
  onPressOut,
  hasVehicle,
  isVehicleLoading,
}: IdleStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Ready to Drive?</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Go online to start accepting trips
        </Text>
        <Text style={[styles.subtitle2, { color: theme.colors.onSurfaceVariant }]}>
          Click the button below
        </Text>
      </View>

      <View style={styles.bottom}>
        {!hasVehicle && !isVehicleLoading && (
          <View style={[styles.warningBanner, { backgroundColor: theme.colors.errorContainer }]}>
            <MaterialCommunityIcons name="alert" size={20} color={theme.colors.error} />
            <Text style={[styles.warningText, { color: theme.colors.onErrorContainer }]}>
              No vehicle assigned. Contact admin.
            </Text>
          </View>
        )}

        <Pressable
          onPress={onGoOnline}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[
            styles.goOnlineButton,
            { backgroundColor: isPressed ? '#E6A800' : theme.colors.primary },
          ]}
        >
          <Text style={styles.goOnlineButtonText}>GO ONLINE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle2: {
    paddingTop: 32,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  bottom: {
    marginTop: 16,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  goOnlineButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goOnlineButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
