import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import type { Coordinates } from '../types/models';

interface UseUserLocationOptions {
  requestOnMount?: boolean;
}

interface UseUserLocationReturn {
  location: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

const LIPA_CITY_CENTER: Coordinates = {
  latitude: 13.9411,
  longitude: 121.1625,
};

export function useUserLocation(options: UseUserLocationOptions = {}): UseUserLocationReturn {
  const { requestOnMount = true } = options;
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === Location.PermissionStatus.GRANTED;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  }, []);

  const refreshLocation = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setLocation(LIPA_CITY_CENTER);
        setError('Location permission not granted');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Failed to get current location');
      setLocation(LIPA_CITY_CENTER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initLocation = async () => {
      if (requestOnMount) {
        const granted = await requestPermission();
        if (granted) {
          await refreshLocation();
        } else {
          setLocation(LIPA_CITY_CENTER);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initLocation();
  }, [requestOnMount]);

  return {
    location,
    isLoading,
    error,
    permissionStatus,
    requestPermission,
    refreshLocation,
  };
}

export { LIPA_CITY_CENTER };
