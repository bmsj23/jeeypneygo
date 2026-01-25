import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '@jeepneygo/core';
import {
  NotificationStatusCard,
  NotificationSettingsList,
  QuietHoursSection,
  NotificationInfoCard,
  getDefaultNotifications,
  NotificationSetting,
} from '../components/notifications';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // persisted settings from store
  const settings = useSettingsStore((state) => state.settings);
  const toggleNotification = useSettingsStore((state) => state.toggleNotification);
  const setQuietHoursEnabled = useSettingsStore((state) => state.setQuietHoursEnabled);

  // merge persisted settings with default display data
  const notifications = useMemo(() => {
    const defaults = getDefaultNotifications();
    return defaults.map((def) => {
      const stored = settings.notifications.find((s) => s.id === def.id);
      return { ...def, enabled: stored?.enabled ?? def.enabled };
    });
  }, [settings.notifications]);

  const enabledCount = notifications.filter((n) => n.enabled).length;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Notifications',
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <NotificationStatusCard enabledCount={enabledCount} totalCount={notifications.length} />
        <NotificationSettingsList notifications={notifications} onToggle={toggleNotification} />
        <QuietHoursSection
          enabled={settings.quietHoursEnabled}
          onToggle={setQuietHoursEnabled}
          startTime={settings.quietHoursStart}
          endTime={settings.quietHoursEnd}
        />
        <NotificationInfoCard />
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});
