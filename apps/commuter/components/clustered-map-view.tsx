import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import MapView, { Region, PROVIDER_DEFAULT, MapViewProps, Marker } from 'react-native-maps';
import { useTheme } from 'react-native-paper';

interface ClusterMarkerProps {
  count: number;
  color: string;
}

function ClusterMarker({ count, color }: ClusterMarkerProps) {
  const size = Math.min(Math.max(40, 30 + count * 2), 60);

  return (
    <View style={[styles.clusterContainer, { width: size, height: size, backgroundColor: color }]}>
      <Text style={styles.clusterText}>{count}</Text>
    </View>
  );
}

export interface JeepneyClusteredMapViewProps extends Omit<MapViewProps, 'ref'> {
  children?: React.ReactNode;
  clusteringEnabled?: boolean;
  clusterRadius?: number;
  minClusterPoints?: number;
  maxClusterZoom?: number;
  clusterColor?: string;
  onClusterPress?: (cluster: typeof Marker, markers?: (typeof Marker)[]) => void;
}

export const BATANGAS_REGION: Region = {
  latitude: 13.8500,
  longitude: 121.0800,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

// alias for backward compatibility
export const LIPA_REGION = BATANGAS_REGION;

export const JeepneyClusteredMapView = forwardRef<any, JeepneyClusteredMapViewProps>(
  (
    {
      children,
      clusteringEnabled = true,
      clusterRadius = 50,
      minClusterPoints = 3,
      maxClusterZoom = 16,
      clusterColor,
      onClusterPress,
      ...mapProps
    },
    ref
  ) => {
    const theme = useTheme();
    const effectiveClusterColor = clusterColor || theme.colors.primary;

    const renderCluster = useCallback(
      (cluster: any) => {
        const { id, geometry, onPress, properties } = cluster;
        const count = properties?.point_count || 0;

        return (
          <Marker
            key={`cluster-${id}`}
            coordinate={{
              latitude: geometry.coordinates[1],
              longitude: geometry.coordinates[0],
            }}
            onPress={onPress}
            tracksViewChanges={false}
          >
            <ClusterMarker count={count} color={effectiveClusterColor} />
          </Marker>
        );
      },
      [effectiveClusterColor]
    );

    const handleClusterPress = useCallback(
      (cluster: typeof Marker, markers?: (typeof Marker)[]) => {
        if (onClusterPress) {
          onClusterPress(cluster, markers);
        }
      },
      [onClusterPress]
    );

    if (!clusteringEnabled) {
      const MapViewComponent = require('react-native-maps').default;
      return (
        <MapViewComponent ref={ref} provider={PROVIDER_DEFAULT} {...mapProps}>
          {children}
        </MapViewComponent>
      );
    }

    return (
      <ClusteredMapView
        ref={ref}
        provider={PROVIDER_DEFAULT}
        clusterColor={effectiveClusterColor}
        clusterTextColor="#FFFFFF"
        clusterFontFamily="System"
        radius={clusterRadius}
        minPoints={minClusterPoints}
        maxZoom={maxClusterZoom}
        renderCluster={renderCluster}
        onClusterPress={handleClusterPress}
        preserveClusterPressBehavior
        spiralEnabled={true}
        spiderLineColor={effectiveClusterColor}
        {...mapProps}
      >
        {children}
      </ClusteredMapView>
    );
  }
);

JeepneyClusteredMapView.displayName = 'JeepneyClusteredMapView';

const styles = StyleSheet.create({
  clusterContainer: {
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clusterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default JeepneyClusteredMapView;
