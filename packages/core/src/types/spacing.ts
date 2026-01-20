import type { Coordinates, ActiveTripWithDetails } from './models';

// spacing thresholds in kilometers
export interface SpacingThresholds {
  minSpacingKm: number;
  maxSpacingKm: number;
  optimalMinKm: number;
  optimalMaxKm: number;
  criticalMinKm: number;
}

// default thresholds for lipa city routes
export const DEFAULT_SPACING_THRESHOLDS: SpacingThresholds = {
  minSpacingKm: 0.5,
  maxSpacingKm: 3.0,
  optimalMinKm: 0.8,
  optimalMaxKm: 2.0,
  criticalMinKm: 0.3,
};

// spacing status between drivers
export type SpacingStatus = 'optimal' | 'too_close' | 'too_far' | 'isolated' | 'critical';

// driver spacing information
export interface DriverSpacing {
  tripId: string;
  driverId: string;
  driverName: string;
  position: Coordinates;
  distanceAhead: number | null;
  distanceBehind: number | null;
  driverAhead: ActiveTripWithDetails | null;
  driverBehind: ActiveTripWithDetails | null;
  spacingStatus: SpacingStatus;
  timeToDriverAhead: number | null;
  timeToDriverBehind: number | null;
  routeProgressPercent: number | null;
}

// spacing alert for notifications
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SpacingAlert {
  id: string;
  type: 'too_close' | 'too_far' | 'bunching' | 'gap';
  severity: AlertSeverity;
  message: string;
  affectedDriverIds: string[];
  timestamp: Date;
  distanceKm: number | null;
}

// route geometry for position calculations
export interface RouteWaypoint {
  lat: number;
  lng: number;
}

export interface RouteGeometry {
  routeId: string;
  polyline: string | null;
  waypoints: RouteWaypoint[];
  totalLengthKm: number;
}

// spacing calculation result
export interface SpacingCalculationResult {
  spacingMap: Map<string, DriverSpacing>;
  alerts: SpacingAlert[];
  routeStats: RouteSpacingStats;
}

// aggregate stats for a route
export interface RouteSpacingStats {
  routeId: string;
  activeDriverCount: number;
  averageSpacingKm: number;
  minSpacingKm: number;
  maxSpacingKm: number;
  driversWithOptimalSpacing: number;
  driversWithPoorSpacing: number;
}
