import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MapControlsProps {
  isLoading: boolean;
  onCenterUser: () => void;
}

export function MapControls({ isLoading, onCenterUser }: MapControlsProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      {isLoading && (
        <View style={[styles.loadingOverlay, { top: insets.top + 160 }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      <Pressable
        onPress={onCenterUser}
        style={[styles.locationButton, { backgroundColor: theme.colors.surface, top: insets.top + 180 }]}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={theme.colors.primary} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
