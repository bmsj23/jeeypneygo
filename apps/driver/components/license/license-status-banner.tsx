import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LicenseStatusBannerProps {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number;
}

export function LicenseStatusBanner({
  isExpired,
  isExpiringSoon,
  daysUntilExpiry,
}: LicenseStatusBannerProps) {
  const theme = useTheme();

  if (isExpired) {
    return (
      <View style={[styles.statusBanner, { backgroundColor: '#FFEBEE' }]}>
        <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
        <View style={styles.statusBannerText}>
          <Text style={[styles.statusBannerTitle, { color: '#F44336' }]}>License Expired</Text>
          <Text style={[styles.statusBannerSubtitle, { color: '#D32F2F' }]}>
            Please renew your license to continue driving
          </Text>
        </View>
      </View>
    );
  }

  if (isExpiringSoon) {
    return (
      <View style={[styles.statusBanner, { backgroundColor: '#FFF3E0' }]}>
        <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#F57C00" />
        <View style={styles.statusBannerText}>
          <Text style={[styles.statusBannerTitle, { color: '#F57C00' }]}>Expiring Soon</Text>
          <Text style={[styles.statusBannerSubtitle, { color: '#EF6C00' }]}>
            {daysUntilExpiry} days until expiration
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.statusBanner, { backgroundColor: '#E8F5E9' }]}>
      <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
      <View style={styles.statusBannerText}>
        <Text style={[styles.statusBannerTitle, { color: '#4CAF50' }]}>License Valid</Text>
        <Text style={[styles.statusBannerSubtitle, { color: '#388E3C' }]}>
          Valid for {daysUntilExpiry} more days
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 14,
  },
  statusBannerText: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBannerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
