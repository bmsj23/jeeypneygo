import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@jeepneygo/ui';
import type { TripSummary } from '@jeepneygo/core';

interface TripSummaryModalProps {
  visible: boolean;
  tripSummary: TripSummary | null;
  onDismiss: () => void;
  onNewTrip: () => void;
}

export function TripSummaryModal({
  visible,
  tripSummary,
  onDismiss,
  onNewTrip,
}: TripSummaryModalProps) {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.content}>
          <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Trip Complete!</Text>

          {tripSummary && (
            <>
              <Text style={[styles.routeName, { color: theme.colors.onSurfaceVariant }]}>
                {tripSummary.routeName}
              </Text>

              <View style={styles.earningsHighlight}>
                <Text style={styles.earningsLabel}>You Earned</Text>
                <Text style={styles.earningsAmount}>₱{tripSummary.totalFare?.toFixed(2) || '0.00'}</Text>
              </View>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                    {Math.floor(tripSummary.duration / 60)}:{(tripSummary.duration % 60).toString().padStart(2, '0')}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Duration</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                    {tripSummary.totalPassengers}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Passengers</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                    {tripSummary.regularPassengers || 0}/{tripSummary.discountedPassengers || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Reg/Disc</Text>
                </View>
              </View>
            </>
          )}

          <Button mode="contained" onPress={onNewTrip} style={styles.newTripButton}>
            Start New Trip
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 24,
    padding: 32,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    marginBottom: 24,
  },
  earningsHighlight: {
    backgroundColor: '#1A1A2E15',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  earningsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 48,
  },
  newTripButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 28,
  },
});
