import React, { memo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Marker, Circle } from 'react-native-maps';
import { JeepneySvg } from '@jeepneygo/ui';
import { useCompassHeading } from '@jeepneygo/core';

interface DriverSelfMarkerProps {
  coordinate: { latitude: number; longitude: number };
  gpsHeading?: number;
  gpsSpeed?: number;
  routeColor?: string;
}

const MARKER_SIZE = 56;
const HEADING_THRESHOLD = 5;

function DriverSelfMarkerComponent({
  coordinate,
  gpsHeading = 0,
  gpsSpeed = 0,
  routeColor = '#FFB800'
}: DriverSelfMarkerProps) {
  const [displayHeading, setDisplayHeading] = useState(gpsHeading);
  const [pulseRadius, setPulseRadius] = useState(30);
  const lastHeadingRef = useRef(gpsHeading);

  // use compass heading with gps fallback when moving
  const { heading: compassHeading } = useCompassHeading({
    enabled: true,
    gpsHeading,
    gpsSpeed,
    updateIntervalMs: 200,
  });

  // update heading only when change exceeds threshold
  useEffect(() => {
    const currentHeading = lastHeadingRef.current;
    let diff = compassHeading - currentHeading;

    // handle wrap-around
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) >= HEADING_THRESHOLD) {
      setDisplayHeading(compassHeading);
      lastHeadingRef.current = compassHeading;
    }
  }, [compassHeading]);

  // pulse animation using circle radius
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      // oscillate between 30 and 50 meters over ~2.4 seconds (144 frames at 60fps)
      const progress = (Math.sin((frame / 72) * Math.PI) + 1) / 2;
      setPulseRadius(30 + progress * 20);
    };
    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Circle
        center={coordinate}
        radius={pulseRadius}
        fillColor={`${routeColor}30`}
        strokeColor={`${routeColor}50`}
        strokeWidth={2}
      />
      <Marker
        coordinate={coordinate}
        anchor={{ x: 0.5, y: 0.5 }}
        flat={true}
        rotation={displayHeading}
        tracksViewChanges={false}
      >
        <View style={styles.container}>
          <View style={styles.markerWrapper}>
            <JeepneySvg size={MARKER_SIZE} color={routeColor} />
          </View>
          <View style={[styles.youBadge, { backgroundColor: routeColor }]}>
            <Text style={styles.youText}>YOU</Text>
          </View>
        </View>
      </Marker>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: MARKER_SIZE + 20,
    height: MARKER_SIZE + 30,
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

export const DriverSelfMarker = memo(DriverSelfMarkerComponent);
