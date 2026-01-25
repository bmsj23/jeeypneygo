import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, IconButton, Divider } from 'react-native-paper';
import type { DriverSpacing, SpacingStatus } from '@jeepneygo/core';
import { formatDistance, getSpacingStatusColor } from '@jeepneygo/core';

interface SpacingHUDProps {
  spacing: DriverSpacing | null;
  isLoading?: boolean;
  onExpand?: () => void;
  compact?: boolean;
}

function getStatusLabel(status: SpacingStatus): string {
  const labels: Record<SpacingStatus, string> = {
    optimal: 'Good Spacing',
    too_close: 'Too Close',
    too_far: 'Too Far',
    isolated: 'No Nearby Drivers',
    critical: 'Critical',
  };
  return labels[status];
}

function formatTime(minutes: number | null): string {
  if (minutes === null) return '--';
  if (minutes < 1) return '<1 min';
  return `${Math.round(minutes)} min`;
}

export function SpacingHUD({ spacing, isLoading = false, onExpand, compact = false }: SpacingHUDProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Surface style={[styles.container, compact && styles.compactContainer]} elevation={3}>
        <Text variant="bodySmall" style={styles.loadingText}>
          Loading spacing data...
        </Text>
      </Surface>
    );
  }

  if (!spacing) {
    return (
      <Surface style={[styles.container, compact && styles.compactContainer]} elevation={3}>
        <Text variant="bodySmall" style={styles.noDataText}>
          Start a trip to see spacing
        </Text>
      </Surface>
    );
  }

  const statusColor = getSpacingStatusColor(spacing.spacingStatus);
  const aheadColor =
    spacing.distanceAhead !== null && spacing.distanceAhead < 0.5
      ? theme.colors.error
      : theme.colors.onSurface;
  const behindColor =
    spacing.distanceBehind !== null && spacing.distanceBehind < 0.5
      ? theme.colors.error
      : theme.colors.onSurface;

  if (compact) {
    return (
      <Surface style={[styles.container, styles.compactContainer]} elevation={3}>
        <View style={styles.compactContent}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <View style={styles.compactDistances}>
            <Text style={[styles.compactDistance, { color: aheadColor }]}>
              ↑ {formatDistance(spacing.distanceAhead)}
            </Text>
            <Text style={[styles.compactDistance, { color: behindColor }]}>
              ↓ {formatDistance(spacing.distanceBehind)}
            </Text>
          </View>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container} elevation={3}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text variant="labelLarge" style={styles.statusText}>
            {getStatusLabel(spacing.spacingStatus)}
          </Text>
        </View>
        {onExpand && (
          <IconButton
            icon="arrow-expand"
            size={18}
            onPress={onExpand}
            style={styles.expandButton}
          />
        )}
      </View>

      <Divider style={styles.divider} />

      <View style={styles.spacingGrid}>
        <View style={styles.spacingItem}>
          <Text style={styles.arrowIcon}>▲</Text>
          <Text style={[styles.distanceValue, { color: aheadColor }]}>
            {formatDistance(spacing.distanceAhead)}
          </Text>
          <Text style={styles.label}>ahead</Text>
          {spacing.timeToDriverAhead !== null && (
            <Text style={styles.timeValue}>~{formatTime(spacing.timeToDriverAhead)}</Text>
          )}
          {spacing.driverAhead && (
            <Text style={styles.driverName} numberOfLines={1}>
              {spacing.driverAhead.driver?.display_name || 'Driver'}
            </Text>
          )}
        </View>

        <View style={styles.centerIndicator}>
          <View style={[styles.statusCircle, { borderColor: statusColor }]}>
            <Text style={styles.youLabel}>YOU</Text>
          </View>
          {spacing.routeProgressPercent !== null && (
            <Text style={styles.progressText}>{Math.round(spacing.routeProgressPercent)}%</Text>
          )}
        </View>

        <View style={styles.spacingItem}>
          <Text style={styles.arrowIcon}>▼</Text>
          <Text style={[styles.distanceValue, { color: behindColor }]}>
            {formatDistance(spacing.distanceBehind)}
          </Text>
          <Text style={styles.label}>behind</Text>
          {spacing.timeToDriverBehind !== null && (
            <Text style={styles.timeValue}>~{formatTime(spacing.timeToDriverBehind)}</Text>
          )}
          {spacing.driverBehind && (
            <Text style={styles.driverName} numberOfLines={1}>
              {spacing.driverBehind.driver?.display_name || 'Driver'}
            </Text>
          )}
        </View>
      </View>

      {(spacing.spacingStatus === 'critical' || spacing.spacingStatus === 'too_close') && (
        <View style={[styles.warningBanner, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.warningText, { color: statusColor }]}>
            {spacing.spacingStatus === 'critical'
              ? 'Slow down! Very close to driver ahead'
              : 'Consider slowing down to maintain spacing'}
          </Text>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 12,
    minWidth: 280,
    backgroundColor: '#FFFFFF',
  },
  compactContainer: {
    minWidth: 120,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontWeight: '600',
  },
  expandButton: {
    margin: -4,
  },
  divider: {
    marginVertical: 8,
  },
  spacingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  spacingItem: {
    flex: 1,
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 4,
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  timeValue: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 2,
  },
  driverName: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 2,
    maxWidth: 80,
  },
  centerIndicator: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  youLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#212121',
  },
  progressText: {
    fontSize: 10,
    color: '#757575',
    marginTop: 4,
  },
  warningBanner: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginRight: 8,
  },
  compactDistances: {
    justifyContent: 'center',
  },
  compactDistance: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    color: '#757575',
    textAlign: 'center',
  },
  noDataText: {
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default SpacingHUD;
