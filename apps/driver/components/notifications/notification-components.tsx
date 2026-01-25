import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface NotificationSetting {
  id: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface StatusCardProps {
  enabledCount: number;
  totalCount: number;
}

export function NotificationStatusCard({ enabledCount, totalCount }: StatusCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.statusCard, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={[styles.statusIcon, { backgroundColor: theme.colors.primary }]}>
        <MaterialCommunityIcons name="bell-check" size={24} color="#1A237E" />
      </View>
      <View style={styles.statusText}>
        <Text style={[styles.statusTitle, { color: theme.colors.onSurface }]}>
          {enabledCount} of {totalCount} enabled
        </Text>
        <Text style={[styles.statusSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Stay updated with important alerts
        </Text>
      </View>
    </View>
  );
}

interface NotificationSettingsListProps {
  notifications: NotificationSetting[];
  onToggle: (id: string) => void;
}

export function NotificationSettingsList({ notifications, onToggle }: NotificationSettingsListProps) {
  const theme = useTheme();

  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Notification Types
      </Text>
      <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
        {notifications.map((item, index) => (
          <React.Fragment key={item.id}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => onToggle(item.id)}
                color={theme.colors.primary}
              />
            </View>
            {index < notifications.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </>
  );
}

interface QuietHoursSectionProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
  startTime: string;
  endTime: string;
}

export function QuietHoursSection({ enabled, onToggle, startTime, endTime }: QuietHoursSectionProps) {
  const theme = useTheme();

  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Quiet Hours</Text>
      <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#EDE7F6' }]}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={20} color="#5E35B1" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                Enable Quiet Hours
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                Mute notifications during set times
              </Text>
            </View>
          </View>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            color={theme.colors.primary}
          />
        </View>

        {enabled && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={styles.quietHoursRow}>
              <View style={styles.quietHoursItem}>
                <Text style={[styles.quietHoursLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Start
                </Text>
                <Pressable
                  style={[styles.timeButton, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text style={[styles.timeText, { color: theme.colors.onSurface }]}>
                    {startTime}
                  </Text>
                </Pressable>
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={theme.colors.onSurfaceVariant}
                style={{ marginTop: 24 }}
              />
              <View style={styles.quietHoursItem}>
                <Text style={[styles.quietHoursLabel, { color: theme.colors.onSurfaceVariant }]}>
                  End
                </Text>
                <Pressable
                  style={[styles.timeButton, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text style={[styles.timeText, { color: theme.colors.onSurface }]}>
                    {endTime}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
}

export function NotificationInfoCard() {
  return (
    <View style={[styles.infoCard, { backgroundColor: '#FFF3E0' }]}>
      <MaterialCommunityIcons name="information-outline" size={20} color="#F57C00" />
      <Text style={styles.infoText}>
        Push notifications require permission from your device settings. Make sure notifications are enabled for JeepneyGo Driver.
      </Text>
    </View>
  );
}

// default notification settings
export function getDefaultNotifications(): NotificationSetting[] {
  return [
    {
      id: 'trip-reminders',
      icon: 'bell-ring',
      iconColor: '#1976D2',
      iconBg: '#E3F2FD',
      title: 'Trip Reminders',
      description: "Get reminded when you haven't started a trip in a while",
      enabled: true,
    },
    {
      id: 'passenger-alerts',
      icon: 'account-group',
      iconColor: '#4CAF50',
      iconBg: '#E8F5E9',
      title: 'Passenger Alerts',
      description: 'Notifications for passenger count changes',
      enabled: true,
    },
    {
      id: 'spacing-alerts',
      icon: 'bus-multiple',
      iconColor: '#F57C00',
      iconBg: '#FFF3E0',
      title: 'Spacing Alerts',
      description: 'Alert when another jeepney is too close or far',
      enabled: true,
    },
    {
      id: 'earnings-summary',
      icon: 'wallet',
      iconColor: '#7B1FA2',
      iconBg: '#F3E5F5',
      title: 'Earnings Summary',
      description: 'Daily summary of your earnings',
      enabled: false,
    },
    {
      id: 'route-updates',
      icon: 'routes',
      iconColor: '#00897B',
      iconBg: '#E0F2F1',
      title: 'Route Updates',
      description: 'Changes to your assigned route or schedules',
      enabled: true,
    },
    {
      id: 'app-updates',
      icon: 'cellphone-arrow-down',
      iconColor: '#546E7A',
      iconBg: '#ECEFF1',
      title: 'App Updates',
      description: 'New features and improvements',
      enabled: true,
    },
  ];
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 14,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 16,
    marginBottom: 24,
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  quietHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
  },
  quietHoursItem: {
    alignItems: 'center',
  },
  quietHoursLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
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
    color: '#F57C00',
    lineHeight: 18,
  },
});
