import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { calculateFareBetweenStops, formatFare, calculateDistance } from '@jeepneygo/core';

const COLORS = {
  primary: '#1A237E',
  success: '#16A34A',
  info: '#2563EB',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  surface: '#F8F9FA',
  background: '#FFFFFF',
  border: '#E5E7EB',
};

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Route {
  base_fare?: number | null;
  per_km_rate?: number | null;
}

interface FareEstimatorProps {
  route: Route;
  stops: Stop[];
  routeColor?: string;
}

export function FareEstimator({ route, stops, routeColor = COLORS.primary }: FareEstimatorProps) {
  const [fromStop, setFromStop] = useState<Stop | null>(null);
  const [toStop, setToStop] = useState<Stop | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fareCalculation = useMemo(() => {
    if (!fromStop || !toStop || fromStop.id === toStop.id) return null;
    return calculateFareBetweenStops(
      { base_fare: route.base_fare ?? 13, per_km_rate: route.per_km_rate ?? 1.8 },
      fromStop,
      toStop
    );
  }, [fromStop, toStop, route]);

  const handleSwapStops = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  const renderStopPicker = (
    visible: boolean,
    onClose: () => void,
    onSelect: (stop: Stop) => void,
    excludeStop: Stop | null,
    title: string
  ) => (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable onPress={onClose} style={styles.modalCloseButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
          </Pressable>
        </View>
        <ScrollView style={styles.stopsList} showsVerticalScrollIndicator={false}>
          {stops.map((stop) => (
            <Pressable
              key={stop.id}
              style={[
                styles.stopItem,
                excludeStop?.id === stop.id && styles.stopItemDisabled,
              ]}
              onPress={() => {
                if (excludeStop?.id !== stop.id) {
                  onSelect(stop);
                  onClose();
                }
              }}
              disabled={excludeStop?.id === stop.id}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={excludeStop?.id === stop.id ? COLORS.border : routeColor}
              />
              <Text
                style={[
                  styles.stopItemText,
                  excludeStop?.id === stop.id && styles.stopItemTextDisabled,
                ]}
              >
                {stop.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="calculator-variant" size={20} color={routeColor} />
        <Text style={styles.title}>Fare Estimator</Text>
      </View>

      <View style={styles.stopsSelector}>
        {/* from stop */}
        <Pressable
          style={[styles.stopSelector, fromStop && styles.stopSelectorSelected]}
          onPress={() => setShowFromPicker(true)}
        >
          <View style={[styles.stopDot, { backgroundColor: COLORS.success }]} />
          <Text style={[styles.stopSelectorText, !fromStop && styles.stopSelectorPlaceholder]}>
            {fromStop?.name || 'Select origin stop'}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </Pressable>

        {/* swap button */}
        <Pressable
          style={styles.swapButton}
          onPress={handleSwapStops}
          disabled={!fromStop || !toStop}
        >
          <MaterialCommunityIcons
            name="swap-vertical"
            size={20}
            color={fromStop && toStop ? routeColor : COLORS.border}
          />
        </Pressable>

        {/* to stop */}
        <Pressable
          style={[styles.stopSelector, toStop && styles.stopSelectorSelected]}
          onPress={() => setShowToPicker(true)}
        >
          <View style={[styles.stopDot, { backgroundColor: '#DC2626' }]} />
          <Text style={[styles.stopSelectorText, !toStop && styles.stopSelectorPlaceholder]}>
            {toStop?.name || 'Select destination stop'}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      {/* fare result */}
      {fareCalculation && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.fareResult}>
          <View style={styles.fareRow}>
            <View style={styles.fareMain}>
              <Text style={styles.fareLabel}>Estimated Fare</Text>
              <Text style={[styles.fareAmount, { color: routeColor }]}>
                {formatFare(fareCalculation.regularFare)}
              </Text>
            </View>
            <View style={styles.fareDetails}>
              <View style={styles.fareDetailItem}>
                <MaterialCommunityIcons name="map-marker-distance" size={14} color={COLORS.textSecondary} />
                <Text style={styles.fareDetailText}>{fareCalculation.distanceKm.toFixed(1)} km</Text>
              </View>
              <View style={[styles.fareDetailItem, styles.discountItem]}>
                <MaterialCommunityIcons name="ticket-percent" size={14} color={COLORS.success} />
                <Text style={[styles.fareDetailText, { color: COLORS.success }]}>
                  {formatFare(fareCalculation.discountedFare)} discounted
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {!fareCalculation && fromStop && toStop && fromStop.id === toStop.id && (
        <Text style={styles.sameStopNote}>Please select different origin and destination stops</Text>
      )}

      {/* stop pickers */}
      {renderStopPicker(
        showFromPicker,
        () => setShowFromPicker(false),
        setFromStop,
        toStop,
        'Select Origin Stop'
      )}
      {renderStopPicker(
        showToPicker,
        () => setShowToPicker(false),
        setToStop,
        fromStop,
        'Select Destination Stop'
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  stopsSelector: {
    gap: 8,
  },
  stopSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  stopSelectorSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stopSelectorText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  stopSelectorPlaceholder: {
    color: COLORS.textSecondary,
  },
  swapButton: {
    alignSelf: 'center',
    padding: 4,
  },
  fareResult: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareMain: {},
  fareLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fareAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  fareDetails: {
    alignItems: 'flex-end',
    gap: 4,
  },
  fareDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fareDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  discountItem: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sameStopNote: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    margin: 20,
    borderRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  stopsList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  stopItemDisabled: {
    opacity: 0.4,
  },
  stopItemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  stopItemTextDisabled: {
    color: COLORS.textSecondary,
  },
});
