import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import type { ActiveTripWithDetails, Coordinates, Route } from '../types/models';
import type {
  DriverSpacing,
  SpacingAlert,
  SpacingCalculationResult,
  SpacingThresholds,
  RouteSpacingStats,
  RouteWaypoint,
} from '../types/spacing';
import {
  calculateDriverSpacing,
  getDriverSpacing,
  getCriticalAlerts,
  waypointsToCoordinates,
  decodePolyline,
} from '../utils/driver-spacing';
import { DEFAULT_SPACING_THRESHOLDS } from '../types/spacing';

interface UseDriverSpacingOptions {
  // current driver's trip id (for driver app)
  currentTripId?: string;
  // custom thresholds for spacing calculations
  thresholds?: SpacingThresholds;
  // throttle interval in ms (default: 2000)
  throttleMs?: number;
  // whether to show toast alerts
  enableAlerts?: boolean;
}

interface UseDriverSpacingReturn {
  // map of trip id to spacing data
  spacingMap: Map<string, DriverSpacing>;
  // current driver's spacing (if currentTripId provided)
  currentDriverSpacing: DriverSpacing | null;
  // all alerts
  alerts: SpacingAlert[];
  // critical alerts only
  criticalAlerts: SpacingAlert[];
  // new alerts since last check (for toast notifications)
  newAlerts: SpacingAlert[];
  // aggregate stats for the route
  routeStats: RouteSpacingStats | null;
  // last calculation timestamp
  lastUpdated: Date | null;
  // clear new alerts after displaying
  clearNewAlerts: () => void;
}

// throttle helper
function useThrottle<T>(value: T, intervalMs: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdatedRef.current >= intervalMs) {
      setThrottledValue(value);
      lastUpdatedRef.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdatedRef.current = Date.now();
      }, intervalMs - (now - lastUpdatedRef.current));
      return () => clearTimeout(timeoutId);
    }
  }, [value, intervalMs]);

  return throttledValue;
}

// extract route coordinates from route data
function getRouteCoordinates(route: Route | null): Coordinates[] | null {
  if (!route) return null;

  // prefer polyline if available
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

  return null;
}

export function useDriverSpacing(
  trips: ActiveTripWithDetails[],
  routeId: string,
  route: Route | null = null,
  options: UseDriverSpacingOptions = {}
): UseDriverSpacingReturn {
  const {
    currentTripId,
    thresholds = DEFAULT_SPACING_THRESHOLDS,
    throttleMs = 2000,
    enableAlerts = true,
  } = options;

  // throttle trips to reduce calculation frequency
  const throttledTrips = useThrottle(trips, throttleMs);

  // track previous alerts for detecting new ones
  const prevAlertsRef = useRef<Set<string>>(new Set());
  const [newAlerts, setNewAlerts] = useState<SpacingAlert[]>([]);

  // get route coordinates for position projection
  const routeCoordinates = useMemo(() => getRouteCoordinates(route), [route]);

  // main spacing calculation (memoized)
  const result = useMemo((): SpacingCalculationResult => {
    if (throttledTrips.length === 0 || !routeId) {
      return {
        spacingMap: new Map(),
        alerts: [],
        routeStats: {
          routeId: routeId || '',
          activeDriverCount: 0,
          averageSpacingKm: 0,
          minSpacingKm: 0,
          maxSpacingKm: 0,
          driversWithOptimalSpacing: 0,
          driversWithPoorSpacing: 0,
        },
      };
    }

    return calculateDriverSpacing(throttledTrips, routeId, routeCoordinates, thresholds);
  }, [throttledTrips, routeId, routeCoordinates, thresholds]);

  // current driver's spacing
  const currentDriverSpacing = useMemo(() => {
    if (!currentTripId) return null;
    return getDriverSpacing(currentTripId, result);
  }, [currentTripId, result]);

  // critical alerts
  const criticalAlerts = useMemo(() => getCriticalAlerts(result), [result]);

  // detect new alerts
  useEffect(() => {
    if (!enableAlerts) return;

    const currentAlertIds = new Set(result.alerts.map((a) => a.id));
    const newAlertList: SpacingAlert[] = [];

    result.alerts.forEach((alert) => {
      // check if this is a new alert (by type and affected drivers, not exact id)
      const alertKey = `${alert.type}-${alert.affectedDriverIds.sort().join('-')}`;
      if (!prevAlertsRef.current.has(alertKey) && alert.severity !== 'info') {
        newAlertList.push(alert);
      }
    });

    if (newAlertList.length > 0) {
      setNewAlerts(newAlertList);
    }

    // update previous alerts reference
    prevAlertsRef.current = new Set(
      result.alerts.map((a) => `${a.type}-${a.affectedDriverIds.sort().join('-')}`)
    );
  }, [result.alerts, enableAlerts]);

  // clear new alerts callback
  const clearNewAlerts = useCallback(() => {
    setNewAlerts([]);
  }, []);

  // last updated timestamp
  const lastUpdated = useMemo(() => (throttledTrips.length > 0 ? new Date() : null), [throttledTrips]);

  return {
    spacingMap: result.spacingMap,
    currentDriverSpacing,
    alerts: result.alerts,
    criticalAlerts,
    newAlerts,
    routeStats: result.routeStats,
    lastUpdated,
    clearNewAlerts,
  };
}

// hook to get spacing for a single driver
export function useSingleDriverSpacing(
  trips: ActiveTripWithDetails[],
  tripId: string,
  routeId: string,
  route: Route | null = null
): DriverSpacing | null {
  const { currentDriverSpacing } = useDriverSpacing(trips, routeId, route, {
    currentTripId: tripId,
    throttleMs: 1000,
    enableAlerts: false,
  });

  return currentDriverSpacing;
}
