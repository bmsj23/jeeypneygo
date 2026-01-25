import { useEffect, useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { Magnetometer } from 'expo-sensors';

interface MagnetometerData {
  x: number;
  y: number;
  z: number;
}

interface UseCompassHeadingOptions {
  enabled?: boolean;
  gpsHeading?: number | null;
  gpsSpeed?: number | null;
  preferGpsAboveSpeedMs?: number;
  updateIntervalMs?: number;
}

interface UseCompassHeadingReturn {
  heading: number;
  source: 'compass' | 'gps' | 'none';
  hasCompass: boolean;
  error: Error | null;
}

// minimum speed (m/s) above which gps heading is preferred (about 5 km/h)
const DEFAULT_GPS_SPEED_THRESHOLD = 1.4;

// low-pass filter alpha for smoothing compass readings
const SMOOTHING_ALPHA = 0.15;

export function useCompassHeading(options: UseCompassHeadingOptions = {}): UseCompassHeadingReturn {
  const {
    enabled = true,
    gpsHeading = null,
    gpsSpeed = null,
    preferGpsAboveSpeedMs = DEFAULT_GPS_SPEED_THRESHOLD,
    updateIntervalMs = 100,
  } = options;

  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [hasCompass, setHasCompass] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const smoothedHeadingRef = useRef<number>(0);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  // check if magnetometer is available
  useEffect(() => {
    let mounted = true;

    const checkAvailability = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (mounted) {
          setHasCompass(isAvailable);
          if (!isAvailable) {
            setError(new Error('Magnetometer not available on this device'));
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setHasCompass(false);
        }
      }
    };

    checkAvailability();
    return () => {
      mounted = false;
    };
  }, []);

  // calculate heading from magnetometer data
  const calculateHeading = useCallback((data: MagnetometerData): number => {
    const { x, y } = data;

    // calculate angle from magnetic north
    let angle = Math.atan2(y, x) * (180 / Math.PI);

    // normalize to 0-360
    if (angle < 0) {
      angle += 360;
    }

    // adjust for device orientation on android
    if (Platform.OS === 'android') {
      angle = (angle + 90) % 360;
    }

    return angle;
  }, []);

  // subscribe to magnetometer updates
  useEffect(() => {
    if (!enabled || !hasCompass) {
      return;
    }

    Magnetometer.setUpdateInterval(updateIntervalMs);

    const subscription = Magnetometer.addListener((data: MagnetometerData) => {
      const rawHeading = calculateHeading(data);

      // apply low-pass filter for smoothing
      const prevSmoothed = smoothedHeadingRef.current;

      // handle wrap-around at 0/360 boundary
      let diff = rawHeading - prevSmoothed;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      const smoothed = (prevSmoothed + diff * SMOOTHING_ALPHA + 360) % 360;
      smoothedHeadingRef.current = smoothed;

      setCompassHeading(Math.round(smoothed));
    });

    subscriptionRef.current = subscription;

    return () => {
      subscription.remove();
      subscriptionRef.current = null;
    };
  }, [enabled, hasCompass, updateIntervalMs, calculateHeading]);

  // determine which heading source to use
  const shouldUseGps = gpsSpeed !== null && gpsSpeed > preferGpsAboveSpeedMs && gpsHeading !== null;

  let heading: number;
  let source: 'compass' | 'gps' | 'none';

  if (shouldUseGps && gpsHeading !== null) {
    heading = gpsHeading;
    source = 'gps';
  } else if (hasCompass && enabled) {
    heading = compassHeading;
    source = 'compass';
  } else if (gpsHeading !== null) {
    heading = gpsHeading;
    source = 'gps';
  } else {
    heading = 0;
    source = 'none';
  }

  return {
    heading,
    source,
    hasCompass,
    error,
  };
}
