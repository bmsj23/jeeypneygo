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
  currentTripId?: string;
  thresholds?: SpacingThresholds;
  throttleMs?: number;
  enableAlerts?: boolean;
}

interface UseDriverSpacingReturn {
  spacingMap: Map<string, DriverSpacing>;
  currentDriverSpacing: DriverSpacing | null;
  alerts: SpacingAlert[];
  criticalAlerts: SpacingAlert[];
  newAlerts: SpacingAlert[];
  routeStats: RouteSpacingStats | null;
  lastUpdated: Date | null;
  clearNewAlerts: () => void;
}

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

function getRouteCoordinates(route: Route | null): Coordinates[] | null {
  if (!route) return null;

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

  const throttledTrips = useThrottle(trips, throttleMs);

  const prevAlertsRef = useRef<Set<string>>(new Set());
  const [newAlerts, setNewAlerts] = useState<SpacingAlert[]>([]);

  const routeCoordinates = useMemo(() => getRouteCoordinates(route), [route]);

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

  const currentDriverSpacing = useMemo(() => {
    if (!currentTripId) return null;
    return getDriverSpacing(currentTripId, result);
  }, [currentTripId, result]);

  const criticalAlerts = useMemo(() => getCriticalAlerts(result), [result]);

  useEffect(() => {
    if (!enableAlerts) return;

    const currentAlertIds = new Set(result.alerts.map((a) => a.id));
    const newAlertList: SpacingAlert[] = [];

    result.alerts.forEach((alert) => {
      const alertKey = `${alert.type}-${alert.affectedDriverIds.sort().join('-')}`;
      if (!prevAlertsRef.current.has(alertKey) && alert.severity !== 'info') {
        newAlertList.push(alert);
      }
    });

    if (newAlertList.length > 0) {
      setNewAlerts(newAlertList);
    }

    prevAlertsRef.current = new Set(
      result.alerts.map((a) => `${a.type}-${a.affectedDriverIds.sort().join('-')}`)
    );
  }, [result.alerts, enableAlerts]);

  const clearNewAlerts = useCallback(() => {
    setNewAlerts([]);
  }, []);

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
