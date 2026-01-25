import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface JeepneyETACardProps {
  plateNumber: string;
  driverName?: string;
  routeName: string;
  routeColor: string;
  etaMinutes: number;
  availableSeats: number;
  maxSeats: number;
  distance?: string;
  isStale?: boolean;
  onPress?: () => void;
  onTrack?: () => void;
}

export function JeepneyETACard({
  plateNumber,
  driverName,
  routeName,
  routeColor,
  etaMinutes,
  availableSeats,
  maxSeats,
  distance,
  isStale = false,
  onPress,
  onTrack,
}: JeepneyETACardProps) {
  const theme = useTheme();

  const getETAColor = () => {
    if (etaMinutes <= 3) return '#4CAF50';
    if (etaMinutes <= 5) return '#8BC34A';
    if (etaMinutes <= 10) return '#FFB800';
    return theme.colors.onSurfaceVariant;
  };

  const getSeatsColor = () => {
    const ratio = availableSeats / maxSeats;
    if (ratio > 0.5) return '#4CAF50';
    if (ratio > 0.2) return '#FFB800';
    return theme.colors.error;
  };

  const seatPercentage = (availableSeats / maxSeats) * 100;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderLeftColor: routeColor,
          opacity: isStale ? 0.6 : pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.etaSection}>
        <Text style={[styles.etaValue, { color: getETAColor() }]}>
          {etaMinutes}
        </Text>
        <Text style={[styles.etaUnit, { color: getETAColor() }]}>min</Text>
        {distance && (
          <Text style={[styles.distance, { color: theme.colors.onSurfaceVariant }]}>
            {distance}
          </Text>
        )}
      </View>

      <View style={styles.mainSection}>
        <View style={styles.headerRow}>
          <View style={[styles.routeBadge, { backgroundColor: routeColor + '20' }]}>
            <View style={[styles.routeDot, { backgroundColor: routeColor }]} />
            <Text style={[styles.routeName, { color: routeColor }]} numberOfLines={1}>
              {routeName}
            </Text>
          </View>
          {isStale && (
            <View style={[styles.staleBadge, { backgroundColor: theme.colors.errorContainer }]}>
              <MaterialCommunityIcons name="clock-alert" size={12} color={theme.colors.error} />
            </View>
          )}
        </View>

        <Text style={[styles.plateNumber, { color: theme.colors.onSurface }]}>
          {plateNumber}
        </Text>

        {driverName && (
          <View style={styles.driverRow}>
            <MaterialCommunityIcons
              name="account"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.driverName, { color: theme.colors.onSurfaceVariant }]}>
              {driverName}
            </Text>
          </View>
        )}

        <View style={styles.seatsSection}>
          <View style={[styles.seatsBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.seatsFill,
                { width: `${seatPercentage}%`, backgroundColor: getSeatsColor() },
              ]}
            />
          </View>
          <Text style={[styles.seatsText, { color: getSeatsColor() }]}>
            {availableSeats} seats
          </Text>
        </View>
      </View>

      {onTrack && (
        <Pressable
          onPress={onTrack}
          style={[styles.trackButton, { backgroundColor: theme.colors.primaryContainer }]}
        >
          <MaterialCommunityIcons
            name="navigation-variant"
            size={20}
            color={theme.colors.primary}
          />
        </Pressable>
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
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  etaSection: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 48,
  },
  etaValue: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  etaUnit: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  distance: {
    fontSize: 11,
    marginTop: 4,
  },
  mainSection: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeName: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 120,
  },
  staleBadge: {
    padding: 4,
    borderRadius: 8,
  },
  plateNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  driverName: {
    fontSize: 13,
  },
  seatsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seatsBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  seatsFill: {
    height: '100%',
    borderRadius: 3,
  },
  seatsText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 55,
    textAlign: 'right',
  },
  trackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
