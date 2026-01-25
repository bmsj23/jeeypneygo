import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  const [notifications, setNotifications] = useState<NotificationSetting[]>(getDefaultNotifications());
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart] = useState('22:00');
  const [quietHoursEnd] = useState('07:00');

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

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
          enabled={quietHoursEnabled}
          onToggle={setQuietHoursEnabled}
          startTime={quietHoursStart}
          endTime={quietHoursEnd}
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
