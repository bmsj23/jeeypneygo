import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Polyline, Circle } from 'react-native-maps';
import type { ActiveTripWithDetails, Coordinates, Route } from '@jeepneygo/core';
import { decodePolyline, waypointsToCoordinates } from '@jeepneygo/core';
import type { RouteWaypoint } from '@jeepneygo/core';

interface RouteSpacingOverlayProps {
  // route data with polyline/waypoints
  route: Route;
  // active trips on this route for driver positions
  trips: ActiveTripWithDetails[];
  // whether to show spacing zones around each driver
  showSpacingZones?: boolean;
  // radius of optimal spacing zone in meters
  spacingZoneRadius?: number;
  // whether to show the route path
  showRoutePath?: boolean;
  // opacity for the overlay elements
  opacity?: number;
}

// default optimal spacing radius in meters
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

  // get route coordinates from polyline or waypoints
  const routeCoordinates = useMemo((): Coordinates[] => {
    // try polyline first
    if (route.polyline) {
      try {
        return decodePolyline(route.polyline);
      } catch {
        // fall through to waypoints
      }
    }

    // try waypoints
    if (route.waypoints && Array.isArray(route.waypoints)) {
      const waypoints = route.waypoints as unknown as RouteWaypoint[];
      if (waypoints.length > 0) {
        return waypointsToCoordinates(waypoints);
      }
    }

    // fallback: connect stop positions (basic approximation)
    return [];
  }, [route.polyline, route.waypoints]);

  // get driver positions
  const driverPositions = useMemo((): Coordinates[] => {
    return trips
      .filter((t) => t.current_latitude && t.current_longitude && t.status === 'active')
      .map((t) => ({
        latitude: t.current_latitude,
        longitude: t.current_longitude,
      }));
  }, [trips]);

  // create polyline connecting drivers (dashed line)
  const driverConnectionCoordinates = useMemo((): Coordinates[] => {
    if (driverPositions.length < 2) return [];

    // sort drivers by latitude (north-south) for consistent line drawing
    return [...driverPositions].sort((a, b) => b.latitude - a.latitude);
  }, [driverPositions]);

  if (!showRoutePath && !showSpacingZones) {
    return null;
  }

  return (
    <>
      {/* main route path */}
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

      {/* dashed line connecting active drivers */}
      {showRoutePath && driverConnectionCoordinates.length >= 2 && (
        <Polyline
          coordinates={driverConnectionCoordinates}
          strokeColor={`${routeColor}AA`}
          strokeWidth={2}
          lineDashPattern={[10, 8]}
          lineCap="round"
        />
      )}

      {/* optimal spacing zones around each driver */}
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
