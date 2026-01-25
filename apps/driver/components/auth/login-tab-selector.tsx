import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = (SCREEN_WIDTH - 48 - 8) / 2;

export type LoginMethod = 'email' | 'phone';

const COLORS = {
  surface: '#F5F5F5',
  text: '#1A1A2E',
  textSecondary: '#757575',
};

interface LoginTabSelectorProps {
  activeTab: LoginMethod;
  onTabChange: (tab: LoginMethod) => void;
}

export function LoginTabSelector({ activeTab, onTabChange }: LoginTabSelectorProps) {
  const tabIndicatorPosition = useSharedValue(0);

  useEffect(() => {
    tabIndicatorPosition.value = withTiming(activeTab === 'email' ? 0 : TAB_WIDTH, {
      duration: 200,
    });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorPosition.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      <Pressable style={styles.tab} onPress={() => onTabChange('email')}>
        <MaterialCommunityIcons
          name="email-outline"
          size={18}
          color={activeTab === 'email' ? '#FFFFFF' : COLORS.textSecondary}
        />
        <Text style={[styles.tabText, { color: activeTab === 'email' ? '#FFFFFF' : COLORS.textSecondary }]}>
          Email
        </Text>
      </Pressable>
      <Pressable style={styles.tab} onPress={() => onTabChange('phone')}>
        <MaterialCommunityIcons
          name="phone-outline"
          size={18}
          color={activeTab === 'phone' ? '#FFFFFF' : COLORS.textSecondary}
        />
        <Text style={[styles.tabText, { color: activeTab === 'phone' ? '#FFFFFF' : COLORS.textSecondary }]}>
          Phone
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  indicator: {
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
