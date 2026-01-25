import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Marker } from 'react-native-maps';
import { JeepneySvg } from '@jeepneygo/ui';

interface DriverSelfMarkerProps {
  coordinate: { latitude: number; longitude: number };
  gpsHeading?: number;
  gpsSpeed?: number;
  routeColor?: string;
}

const MARKER_SIZE = 56;
const PULSE_SIZE = MARKER_SIZE + 24;

function DriverSelfMarkerComponent({
  coordinate,
  gpsHeading = 0,
  routeColor = '#FFB800'
}: DriverSelfMarkerProps) {
  const [needsUpdate, setNeedsUpdate] = useState(true);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCoordRef = useRef({ lat: coordinate.latitude, lng: coordinate.longitude });
  const prevHeadingRef = useRef(gpsHeading);

  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  const scheduleDisable = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    setNeedsUpdate(true);
    updateTimeoutRef.current = setTimeout(() => {
      setNeedsUpdate(false);
    }, 500);
  }, []);

  useEffect(() => {
    scheduleDisable();
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [scheduleDisable]);

  useEffect(() => {
    const latChanged = Math.abs(prevCoordRef.current.lat - coordinate.latitude) > 0.00001;
    const lngChanged = Math.abs(prevCoordRef.current.lng - coordinate.longitude) > 0.00001;

    if (latChanged || lngChanged) {
      scheduleDisable();
      prevCoordRef.current = { lat: coordinate.latitude, lng: coordinate.longitude };
    }
  }, [coordinate.latitude, coordinate.longitude, scheduleDisable]);

  useEffect(() => {
    const headingChanged = Math.abs(prevHeadingRef.current - gpsHeading) > 5;

    if (headingChanged) {
      scheduleDisable();
      prevHeadingRef.current = gpsHeading;
    }
  }, [gpsHeading, scheduleDisable]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.6,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulseScale, pulseOpacity]);

  if (!coordinate || !coordinate.latitude || !coordinate.longitude) {
    return null;
  }

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={gpsHeading}
      tracksViewChanges={needsUpdate}
      flat
      zIndex={999}
    >
      <View style={styles.container}>
        {/* pulse/radar ring with fill */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: `${routeColor}25`,
              borderColor: routeColor,
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
        {/* jeepney icon */}
        <View style={styles.markerWrapper}>
          <JeepneySvg size={MARKER_SIZE} color={routeColor} />
        </View>
        {/* you badge */}
        <View style={[styles.youBadge, { backgroundColor: routeColor }]}>
          <Text style={styles.youText}>YOU</Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: MARKER_SIZE + 50,
    height: MARKER_SIZE + 60,
  },
  pulseRing: {
    position: 'absolute',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
    borderWidth: 2.5,
  },
  markerWrapper: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  youBadge: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  youText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

function arePropsEqual(
  prevProps: DriverSelfMarkerProps,
  nextProps: DriverSelfMarkerProps
): boolean {
  // re-render if position changes significantly
  const latDiff = Math.abs(prevProps.coordinate.latitude - nextProps.coordinate.latitude);
  const lngDiff = Math.abs(prevProps.coordinate.longitude - nextProps.coordinate.longitude);
  if (latDiff > 0.00001 || lngDiff > 0.00001) return false;

  // re-render if gps heading changes by more than 5 degrees
  const headingDiff = Math.abs((prevProps.gpsHeading || 0) - (nextProps.gpsHeading || 0));
  if (headingDiff > 5) return false;

  // re-render if route color changes
  if (prevProps.routeColor !== nextProps.routeColor) return false;

  return true;
}

export const DriverSelfMarker = memo(DriverSelfMarkerComponent, arePropsEqual);
