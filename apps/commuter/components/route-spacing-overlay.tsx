import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Polyline, Circle } from 'react-native-maps';
import type { ActiveTripWithDetails, Coordinates, Route } from '@jeepneygo/core';
import { decodePolyline, waypointsToCoordinates } from '@jeepneygo/core';
import type { RouteWaypoint } from '@jeepneygo/core';

interface RouteSpacingOverlayProps {
  route: Route;
  trips: ActiveTripWithDetails[];
  showSpacingZones?: boolean;
  spacingZoneRadius?: number;
  showRoutePath?: boolean;
  opacity?: number;
}

const DEFAULT_SPACING_RADIUS = 500;

export function RouteSpacingOverlay({
  route,
  trips,
  showSpacingZones = false,
  spacingZoneRadius = DEFAULT_SPACING_RADIUS,
  showRoutePath = true,
  opacity = 0.7,
}: RouteSpacingOverlayProps) {
  const routeColor = route.color || '#FFB800';

  const routeCoordinates = useMemo((): Coordinates[] => {
    if (route.polyline) {
      try {
        return decodePolyline(route.polyline);
      } catch {
      }
    }

    if (route.waypoints && Array.isArray(route.waypoints)) {
      const waypoints = route.waypoints as unknown as RouteWaypoint[];
      if (waypoints.length > 0) {
        return waypointsToCoordinates(waypoints);
      }
    }

    return [];
  }, [route.polyline, route.waypoints]);

  const driverPositions = useMemo((): Coordinates[] => {
    return trips
      .filter((t) => t.current_latitude && t.current_longitude && t.status === 'active')
      .map((t) => ({
        latitude: t.current_latitude,
        longitude: t.current_longitude,
      }));
  }, [trips]);

  const driverConnectionCoordinates = useMemo((): Coordinates[] => {
    if (driverPositions.length < 2) return [];

    return [...driverPositions].sort((a, b) => b.latitude - a.latitude);
  }, [driverPositions]);

  if (!showRoutePath && !showSpacingZones) {
    return null;
  }

  return (
    <>
      {showRoutePath && routeCoordinates.length >= 2 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={routeColor}
          strokeWidth={4}
          lineDashPattern={[1]}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {showRoutePath && driverConnectionCoordinates.length >= 2 && (
        <Polyline
          coordinates={driverConnectionCoordinates}
          strokeColor={`${routeColor}AA`}
          strokeWidth={2}
          lineDashPattern={[10, 8]}
          lineCap="round"
        />
      )}

      {showSpacingZones &&
        driverPositions.map((position, index) => (
          <Circle
            key={`spacing-zone-${index}`}
            center={position}
            radius={spacingZoneRadius}
            fillColor={`${routeColor}15`}
            strokeColor={`${routeColor}40`}
            strokeWidth={1}
          />
        ))}
    </>
  );
}

export default RouteSpacingOverlay;
