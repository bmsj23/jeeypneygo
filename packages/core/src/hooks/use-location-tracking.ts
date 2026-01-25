import { useEffect, useRef, useCallback, useState } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number | null;
  timestamp: number;
}

interface UseLocationTrackingOptions {
  enabled?: boolean;
  intervalMs?: number;
  onLocationUpdate?: (location: LocationData) => void;
  onError?: (error: Error) => void;
}

interface UseLocationTrackingReturn {
  currentLocation: LocationData | null;
  isTracking: boolean;
  hasPermission: boolean | null;
  error: Error | null;
  requestPermission: () => Promise<boolean>;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useLocationTracking(
  options: UseLocationTrackingOptions = {}
): UseLocationTrackingReturn {
  const {
    enabled = false,
    intervalMs = 10000, // 10 seconds default
    onLocationUpdate,
    onError,
  } = options;

  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTrackingRef = useRef(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        setError(new Error('Location permission denied'));
      }

      return granted;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      return false;
    }
  }, [onError]);

  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        const lastKnownData: LocationData = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          heading: lastKnown.coords.heading ?? 0,
          speed: lastKnown.coords.speed ?? 0,
          accuracy: lastKnown.coords.accuracy,
          timestamp: lastKnown.timestamp,
        };
        setCurrentLocation(lastKnownData);
        onLocationUpdate?.(lastKnownData);
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading ?? 0,
        speed: location.coords.speed ?? 0,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      setCurrentLocation(locationData);
      setError(null);
      onLocationUpdate?.(locationData);

      return locationData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      return null;
    }
  }, [onLocationUpdate, onError]);

  const startTracking = useCallback(() => {
    if (isTrackingRef.current) return;

    isTrackingRef.current = true;
    setIsTracking(true);

    getLocation();

    intervalRef.current = setInterval(() => {
      if (isTrackingRef.current) {
        getLocation();
      }
    }, intervalMs);
  }, [getLocation, intervalMs]);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    setIsTracking(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled && hasPermission) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, hasPermission, startTracking, stopTracking]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  return {
    currentLocation,
    isTracking,
    hasPermission,
    error,
    requestPermission,
    startTracking,
    stopTracking,
  };
}
