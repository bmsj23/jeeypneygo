import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = (SCREEN_WIDTH - 48 - 8) / 2;

const COLORS = {
  surface: '#F5F5F5',
  text: '#1A1A2E',
  textSecondary: '#757575',
};

export type LoginMethod = 'email' | 'phone';

interface LoginTabSelectorProps {
  loginMethod: LoginMethod;
  tabIndicatorPosition: SharedValue<number>;
  onSelectEmail: () => void;
  onSelectPhone: () => void;
}

export function LoginTabSelector({
  loginMethod,
  tabIndicatorPosition,
  onSelectEmail,
  onSelectPhone,
}: LoginTabSelectorProps) {
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorPosition.value }],
  }));

  return (
    <View style={styles.tabContainer}>
      <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
      <Pressable style={styles.tab} onPress={onSelectEmail}>
        <MaterialCommunityIcons
          name="email-outline"
          size={18}
          color={loginMethod === 'email' ? '#FFFFFF' : COLORS.textSecondary}
        />
        <Text style={[styles.tabText, { color: loginMethod === 'email' ? '#FFFFFF' : COLORS.textSecondary }]}>
          Email
        </Text>
      </Pressable>
      <Pressable style={styles.tab} onPress={onSelectPhone}>
        <MaterialCommunityIcons
          name="phone-outline"
          size={18}
          color={loginMethod === 'phone' ? '#FFFFFF' : COLORS.textSecondary}
        />
        <Text style={[styles.tabText, { color: loginMethod === 'phone' ? '#FFFFFF' : COLORS.textSecondary }]}>
          Phone
        </Text>
      </Pressable>
    </View>
  );
}

export { TAB_WIDTH };

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: TAB_WIDTH,
    height: '100%',
    backgroundColor: COLORS.text,
    borderRadius: 8,
    top: 4,
    left: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
