import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSetting {
  id: string;
  enabled: boolean;
}

export interface UserSettings {
  notifications: NotificationSetting[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface SettingsStore {
  settings: UserSettings;
  updateNotificationSetting: (id: string, enabled: boolean) => void;
  toggleNotification: (id: string) => void;
  setQuietHoursEnabled: (enabled: boolean) => void;
  setQuietHoursStart: (time: string) => void;
  setQuietHoursEnd: (time: string) => void;
  resetSettings: () => void;
}

const DEFAULT_COMMUTER_NOTIFICATIONS: NotificationSetting[] = [
  { id: 'eta_alerts', enabled: true },
  { id: 'favorite_stops', enabled: true },
  { id: 'promotions', enabled: false },
  { id: 'service_updates', enabled: true },
  { id: 'nearby_jeepneys', enabled: true },
];

const DEFAULT_SETTINGS: UserSettings = {
  notifications: DEFAULT_COMMUTER_NOTIFICATIONS,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      updateNotificationSetting: (id: string, enabled: boolean) => {
        const currentSettings = get().settings;
        const updatedNotifications = currentSettings.notifications.map((n) =>
          n.id === id ? { ...n, enabled } : n
        );
        set({
          settings: {
            ...currentSettings,
            notifications: updatedNotifications,
          },
        });
      },

      toggleNotification: (id: string) => {
        const currentSettings = get().settings;
        const notification = currentSettings.notifications.find((n) => n.id === id);
        if (notification) {
          get().updateNotificationSetting(id, !notification.enabled);
        }
      },

      setQuietHoursEnabled: (enabled: boolean) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quietHoursEnabled: enabled,
          },
        }));
      },

      setQuietHoursStart: (time: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quietHoursStart: time,
          },
        }));
      },

      setQuietHoursEnd: (time: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quietHoursEnd: time,
          },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'jeepneygo-commuter-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);