import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FFB800',
  text: '#1A1A2E',
  textSecondary: '#757575',
};

export function AuthHero() {
  return (
    <View style={styles.heroSection}>
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationCircle}>
          <MaterialCommunityIcons name="map-marker-radius" size={64} color={COLORS.primary} />
        </View>
        <View style={[styles.decorCircle1, { backgroundColor: COLORS.primary }]} />
        <View style={styles.decorCircle2} />
      </View>
      <Text style={styles.heroTitle}>JeepneyGo</Text>
      <Text style={styles.heroTagline}>Track jeepneys in real-time</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustrationContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: 5,
    right: 5,
  },
  decorCircle2: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    bottom: 15,
    left: 5,
    backgroundColor: '#FFE082',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  heroTagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
