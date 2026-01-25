import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LicenseSettingsCardProps {
  renewalReminder: boolean;
  onRenewalReminderChange: (value: boolean) => void;
}

export function LicenseSettingsCard({
  renewalReminder,
  onRenewalReminderChange,
}: LicenseSettingsCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={22}
            color={theme.colors.primary}
          />
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
              Renewal Reminder
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Get notified 90 days before expiration
            </Text>
          </View>
        </View>
        <Switch
          value={renewalReminder}
          onValueChange={onRenewalReminderChange}
          color={theme.colors.primary}
        />
      </View>
    </View>
  );
}

export function LicenseInfoNotice() {
  return (
    <View style={[styles.infoCard, { backgroundColor: '#E3F2FD' }]}>
      <MaterialCommunityIcons name="information-outline" size={20} color="#1976D2" />
      <Text style={styles.infoText}>
        Keep your license photos up to date. This helps verify your identity during account reviews.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
});
