import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ViewMode = 'stops' | 'jeepneys';

interface ViewModeTabsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  stopsCount: number;
  jeepneysCount: number;
  routeColor: string;
}

export function ViewModeTabs({
  viewMode,
  onViewModeChange,
  stopsCount,
  jeepneysCount,
  routeColor,
}: ViewModeTabsProps) {
  const theme = useTheme();

  return (
    <View style={styles.tabsContainer}>
      <Pressable
        style={[
          styles.tab,
          { borderColor: viewMode === 'stops' ? routeColor : 'transparent' },
          viewMode === 'stops' && { backgroundColor: `${routeColor}15` },
        ]}
        onPress={() => onViewModeChange('stops')}
      >
        <MaterialCommunityIcons
          name="map-marker-multiple"
          size={18}
          color={viewMode === 'stops' ? routeColor : theme.colors.onSurfaceVariant}
        />
        <Text
          style={[
            styles.tabText,
            { color: viewMode === 'stops' ? routeColor : theme.colors.onSurfaceVariant },
          ]}
        >
          Stops ({stopsCount})
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.tab,
          { borderColor: viewMode === 'jeepneys' ? routeColor : 'transparent' },
          viewMode === 'jeepneys' && { backgroundColor: `${routeColor}15` },
        ]}
        onPress={() => onViewModeChange('jeepneys')}
      >
        <MaterialCommunityIcons
          name="bus"
          size={18}
          color={viewMode === 'jeepneys' ? routeColor : theme.colors.onSurfaceVariant}
        />
        <Text
          style={[
            styles.tabText,
            { color: viewMode === 'jeepneys' ? routeColor : theme.colors.onSurfaceVariant },
          ]}
        >
          Jeepneys ({jeepneysCount})
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
