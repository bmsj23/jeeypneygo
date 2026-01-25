import React from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const TOAST_COLORS: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: '#E8F5E9', text: '#2E7D32', icon: 'check-circle' },
  error: { bg: '#FFEBEE', text: '#C62828', icon: 'alert-circle' },
  warning: { bg: '#FFF3E0', text: '#E65100', icon: 'alert' },
  info: { bg: '#E3F2FD', text: '#1565C0', icon: 'information' },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <Portal>
      <View style={[styles.container, { top: insets.top + 8 }]}>
        {toasts.map((toast) => {
          const colors = TOAST_COLORS[toast.type];
          return (
            <Animated.View
              key={toast.id}
              style={[styles.toast, { backgroundColor: colors.bg }]}
            >
              <MaterialCommunityIcons
                name={colors.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={20}
                color={colors.text}
              />
              <Text style={[styles.message, { color: colors.text }]} numberOfLines={3}>
                {toast.message}
              </Text>
              <Pressable
                onPress={() => onDismiss(toast.id)}
                hitSlop={8}
                style={styles.dismissButton}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.text} />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
  },
});