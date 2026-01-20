import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface StopCardProps {
  name: string;
  routeName?: string;
  routeColor?: string;
  etaMinutes?: number;
  jeepneyCount?: number;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
}

export function StopCard({
  name,
  routeName,
  routeColor,
  etaMinutes,
  jeepneyCount,
  isFavorite = false,
  onPress,
  onFavoriteToggle,
}: StopCardProps) {
  const theme = useTheme();

  const getETAColor = () => {
    if (!etaMinutes) return theme.colors.onSurfaceVariant;
    if (etaMinutes <= 3) return '#4CAF50';
    if (etaMinutes <= 5) return '#8BC34A';
    if (etaMinutes <= 10) return '#FFB800';
    return theme.colors.onSurfaceVariant;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {/* stop icon with route color */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: (routeColor || theme.colors.primary) + '15' },
        ]}
      >
        <MaterialCommunityIcons
          name="map-marker"
          size={24}
          color={routeColor || theme.colors.primary}
        />
      </View>

      {/* main info */}
      <View style={styles.mainSection}>
        <Text style={[styles.stopName, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {name}
        </Text>

        <View style={styles.detailsRow}>
          {routeName && (
            <View style={styles.routeInfo}>
              <View style={[styles.routeDot, { backgroundColor: routeColor || theme.colors.primary }]} />
              <Text style={[styles.routeText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                {routeName}
              </Text>
            </View>
          )}

          {jeepneyCount !== undefined && jeepneyCount > 0 && (
            <View style={styles.jeepneyInfo}>
              <MaterialCommunityIcons
                name="bus"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={[styles.jeepneyCount, { color: theme.colors.onSurfaceVariant }]}>
                {jeepneyCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* eta display */}
      {etaMinutes !== undefined && (
        <View style={styles.etaSection}>
          <Text style={[styles.etaValue, { color: getETAColor() }]}>{etaMinutes}</Text>
          <Text style={[styles.etaUnit, { color: getETAColor() }]}>min</Text>
        </View>
      )}

      {/* favorite button */}
      {onFavoriteToggle && (
        <Pressable
          onPress={onFavoriteToggle}
          hitSlop={8}
          style={styles.favoriteButton}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#E91E63' : theme.colors.onSurfaceVariant}
          />
        </Pressable>
      )}

      {/* chevron */}
      {!onFavoriteToggle && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mainSection: {
    flex: 1,
    marginRight: 12,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeText: {
    fontSize: 13,
    flex: 1,
  },
  jeepneyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jeepneyCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  etaSection: {
    alignItems: 'center',
    marginRight: 12,
  },
  etaValue: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  etaUnit: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -2,
  },
  favoriteButton: {
    padding: 4,
  },
});
