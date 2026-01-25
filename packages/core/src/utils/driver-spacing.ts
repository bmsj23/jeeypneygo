import type { Coordinates, ActiveTripWithDetails } from '../types/models';
import type {
  DriverSpacing,
  SpacingAlert,
  SpacingCalculationResult,
  SpacingStatus,
  SpacingThresholds,
  RouteSpacingStats,
  RouteWaypoint,
  AlertSeverity,
} from '../types/spacing';
import { calculateDistance } from './eta-calculator';
import { DEFAULT_SPACING_THRESHOLDS } from '../types/spacing';

export function decodePolyline(encoded: string): Coordinates[] {
  const coordinates: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

export function waypointsToCoordinates(waypoints: RouteWaypoint[]): Coordinates[] {
  return waypoints.map((wp) => ({
    latitude: wp.lat,
    longitude: wp.lng,
  }));
}

export function calculateRouteLength(coordinates: Coordinates[]): number {
  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  return totalDistance;
}

export function projectOntoRoute(
  position: Coordinates,
  routeCoordinates: Coordinates[]
): { distanceFromStart: number; nearestPoint: Coordinates; segmentIndex: number } {
  let minDistance = Infinity;
  let nearestPoint = routeCoordinates[0];
  let segmentIndex = 0;
  let distanceAlongRoute = 0;
  let distanceToNearestSegment = 0;

  let cumulativeDistance = 0;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const segmentStart = routeCoordinates[i];
    const segmentEnd = routeCoordinates[i + 1];
    const segmentLength = calculateDistance(segmentStart, segmentEnd);

    const projected = projectOntoSegment(position, segmentStart, segmentEnd);
    const distance = calculateDistance(position, projected.point);

    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = projected.point;
      segmentIndex = i;
      distanceToNearestSegment = cumulativeDistance;
      distanceAlongRoute = cumulativeDistance + segmentLength * projected.t;
    }

    cumulativeDistance += segmentLength;
  }

  return {
    distanceFromStart: distanceAlongRoute,
    nearestPoint,
    segmentIndex,
  };
}

function projectOntoSegment(
  point: Coordinates,
  segmentStart: Coordinates,
  segmentEnd: Coordinates
): { point: Coordinates; t: number } {
  const dx = segmentEnd.longitude - segmentStart.longitude;
  const dy = segmentEnd.latitude - segmentStart.latitude;

  if (dx === 0 && dy === 0) {
    return { point: segmentStart, t: 0 };
  }

  const px = point.longitude - segmentStart.longitude;
  const py = point.latitude - segmentStart.latitude;

  let t = (px * dx + py * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));

  return {
    point: {
      latitude: segmentStart.latitude + t * dy,
      longitude: segmentStart.longitude + t * dx,
    },
    t,
  };
}

function determineSpacingStatus(
  distanceAhead: number | null,
  distanceBehind: number | null,
  thresholds: SpacingThresholds = DEFAULT_SPACING_THRESHOLDS
): SpacingStatus {
  if (distanceAhead === null && distanceBehind === null) {
    return 'isolated';
  }

  const nearestDistance = Math.min(distanceAhead ?? Infinity, distanceBehind ?? Infinity);

  if (nearestDistance < thresholds.criticalMinKm) {
    return 'critical';
  }
  if (nearestDistance < thresholds.minSpacingKm) {
    return 'too_close';
  }
  if (nearestDistance > thresholds.maxSpacingKm) {
    return 'too_far';
  }
  return 'optimal';
}

function sortTripsByRoutePosition(
  trips: ActiveTripWithDetails[],
  routeCoordinates: Coordinates[] | null
): ActiveTripWithDetails[] {
  if (!routeCoordinates || routeCoordinates.length < 2) {
    return [...trips].sort((a, b) => b.current_latitude - a.current_latitude);
  }

  const tripsWithProgress = trips.map((trip) => {
    const projection = projectOntoRoute(
      { latitude: trip.current_latitude, longitude: trip.current_longitude },
      routeCoordinates
    );
    return { trip, distanceFromStart: projection.distanceFromStart };
  });

  return tripsWithProgress
    .sort((a, b) => a.distanceFromStart - b.distanceFromStart)
    .map((item) => item.trip);
}

function generateAlerts(
  spacingMap: Map<string, DriverSpacing>,
  thresholds: SpacingThresholds = DEFAULT_SPACING_THRESHOLDS
): SpacingAlert[] {
  const alerts: SpacingAlert[] = [];
  const processedPairs = new Set<string>();

  spacingMap.forEach((spacing) => {
    if (spacing.spacingStatus === 'critical' && spacing.distanceAhead !== null) {
      const pairKey = [spacing.tripId, spacing.driverAhead?.id].sort().join('-');
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        alerts.push({
          id: `critical-${spacing.tripId}-${Date.now()}`,
          type: 'too_close',
          severity: 'critical',
          message: `${spacing.driverName} is critically close to driver ahead (${formatDistance(spacing.distanceAhead)})`,
          affectedDriverIds: [spacing.driverId, spacing.driverAhead?.driver?.id].filter(
            Boolean
          ) as string[],
          timestamp: new Date(),
          distanceKm: spacing.distanceAhead,
        });
      }
    }

    if (spacing.spacingStatus === 'too_close' && spacing.distanceAhead !== null) {
      const pairKey = [spacing.tripId, spacing.driverAhead?.id].sort().join('-');
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        alerts.push({
          id: `close-${spacing.tripId}-${Date.now()}`,
          type: 'too_close',
          severity: 'warning',
          message: `${spacing.driverName} is too close to driver ahead (${formatDistance(spacing.distanceAhead)})`,
          affectedDriverIds: [spacing.driverId, spacing.driverAhead?.driver?.id].filter(
            Boolean
          ) as string[],
          timestamp: new Date(),
          distanceKm: spacing.distanceAhead,
        });
      }
    }

    if (spacing.spacingStatus === 'too_far') {
      alerts.push({
        id: `gap-${spacing.tripId}-${Date.now()}`,
        type: 'gap',
        severity: 'info',
        message: `Large gap detected near ${spacing.driverName}`,
        affectedDriverIds: [spacing.driverId],
        timestamp: new Date(),
        distanceKm: spacing.distanceAhead ?? spacing.distanceBehind,
      });
    }
  });

  return alerts;
}

function calculateRouteStats(
  routeId: string,
  spacingMap: Map<string, DriverSpacing>
): RouteSpacingStats {
  const spacings = Array.from(spacingMap.values());
  const distances = spacings
    .map((s) => s.distanceAhead)
    .filter((d): d is number => d !== null);

  const optimalCount = spacings.filter((s) => s.spacingStatus === 'optimal').length;
  const poorCount = spacings.filter(
    (s) => s.spacingStatus === 'too_close' || s.spacingStatus === 'critical'
  ).length;

  return {
    routeId,
    activeDriverCount: spacings.length,
    averageSpacingKm: distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0,
    minSpacingKm: distances.length > 0 ? Math.min(...distances) : 0,
    maxSpacingKm: distances.length > 0 ? Math.max(...distances) : 0,
    driversWithOptimalSpacing: optimalCount,
    driversWithPoorSpacing: poorCount,
  };
}

export function formatDistance(km: number | null): string {
  if (km === null) return 'N/A';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function calculateDriverSpacing(
  trips: ActiveTripWithDetails[],
  routeId: string,
  routeCoordinates: Coordinates[] | null = null,
  thresholds: SpacingThresholds = DEFAULT_SPACING_THRESHOLDS
): SpacingCalculationResult {
  const spacingMap = new Map<string, DriverSpacing>();

  const routeTrips = trips.filter((t) => t.route_id === routeId && t.status === 'active');

  if (routeTrips.length === 0) {
    return {
      spacingMap,
      alerts: [],
      routeStats: calculateRouteStats(routeId, spacingMap),
    };
  }

  const routeLength = routeCoordinates ? calculateRouteLength(routeCoordinates) : null;

  const sorted = sortTripsByRoutePosition(routeTrips, routeCoordinates);

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const ahead = i > 0 ? sorted[i - 1] : null;
    const behind = i < sorted.length - 1 ? sorted[i + 1] : null;

    const currentPos: Coordinates = {
      latitude: current.current_latitude,
      longitude: current.current_longitude,
    };

    const distanceAhead = ahead
      ? calculateDistance(currentPos, {
          latitude: ahead.current_latitude,
          longitude: ahead.current_longitude,
        })
      : null;

    const distanceBehind = behind
      ? calculateDistance(currentPos, {
          latitude: behind.current_latitude,
          longitude: behind.current_longitude,
        })
      : null;

    const timeToAhead =
      distanceAhead !== null && current.speed > 0
        ? (distanceAhead / current.speed) * 60
        : null;

    const timeToBehind =
      distanceBehind !== null && behind && behind.speed > 0
        ? (distanceBehind / behind.speed) * 60
        : null;

    let routeProgressPercent: number | null = null;
    if (routeCoordinates && routeLength && routeLength > 0) {
      const projection = projectOntoRoute(currentPos, routeCoordinates);
      routeProgressPercent = (projection.distanceFromStart / routeLength) * 100;
    }

    spacingMap.set(current.id, {
      tripId: current.id,
      driverId: current.driver_id,
      driverName: current.driver?.display_name || 'Unknown',
      position: currentPos,
      distanceAhead,
      distanceBehind,
      driverAhead: ahead,
      driverBehind: behind,
      spacingStatus: determineSpacingStatus(distanceAhead, distanceBehind, thresholds),
      timeToDriverAhead: timeToAhead,
      timeToDriverBehind: timeToBehind,
      routeProgressPercent,
    });
  }

  const alerts = generateAlerts(spacingMap, thresholds);
  const routeStats = calculateRouteStats(routeId, spacingMap);

  return { spacingMap, alerts, routeStats };
}

export function getDriverSpacing(
  tripId: string,
  result: SpacingCalculationResult
): DriverSpacing | null {
  return result.spacingMap.get(tripId) ?? null;
}

export function getCriticalAlerts(result: SpacingCalculationResult): SpacingAlert[] {
  return result.alerts.filter((alert) => alert.severity === 'critical');
}

export function getSpacingStatusColor(status: SpacingStatus): string {
  const colors: Record<SpacingStatus, string> = {
    optimal: '#4CAF50',
    too_close: '#FF9800',
    too_far: '#2196F3',
    isolated: '#9E9E9E',
    critical: '#F44336',
  };
  return colors[status];
}

export function getAlertSeverityColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    info: '#2196F3',
    warning: '#FF9800',
    critical: '#F44336',
  };
  return colors[severity];
}
