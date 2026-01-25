import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LicenseData {
  licenseNumber: string;
  expiryDate: Date;
  issueDate: Date;
  licenseClass: string;
  restrictions: string;
}

interface LicenseInfoCardProps {
  licenseData: LicenseData;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

function InfoRow({
  icon,
  label,
  value,
  iconColor,
  valueColor,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  iconColor: string;
  valueColor?: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: valueColor || theme.colors.onSurface }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />;
}

export function LicenseInfoCard({ licenseData, isExpired, isExpiringSoon }: LicenseInfoCardProps) {
  const theme = useTheme();

  const expiryColor = isExpired ? '#F44336' : isExpiringSoon ? '#F57C00' : '#4CAF50';

  return (
    <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
      <InfoRow
        icon="card-account-details"
        label="License Number"
        value={licenseData.licenseNumber}
        iconColor="#1976D2"
      />
      <Divider />
      <InfoRow
        icon="calendar-check"
        label="Issue Date"
        value={licenseData.issueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        iconColor="#7B1FA2"
      />
      <Divider />
      <InfoRow
        icon="calendar-clock"
        label="Expiry Date"
        value={licenseData.expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        iconColor={expiryColor}
        valueColor={isExpired || isExpiringSoon ? expiryColor : undefined}
      />
      <Divider />
      <InfoRow
        icon="shield-car"
        label="License Class"
        value={licenseData.licenseClass}
        iconColor="#00897B"
      />
      <Divider />
      <InfoRow
        icon="alert-circle-outline"
        label="Restrictions"
        value={licenseData.restrictions}
        iconColor="#546E7A"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  detailsCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
});
