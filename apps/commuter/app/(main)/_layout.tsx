import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon({
  name,
  nameFocused,
  color,
  focused,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  nameFocused: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  focused: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={styles.iconContainer}>
      <View
        style={[
          styles.iconBackground,
          focused && { backgroundColor: `${theme.colors.primary}15` },
        ]}
      >
        <MaterialCommunityIcons name={focused ? nameFocused : name} size={24} color={color} />
      </View>
    </View>
  );
}

export default function MainLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: 64 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="map-outline" nameFocused="map" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Routes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="bus" nameFocused="bus" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="heart-outline" nameFocused="heart" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="account-outline" nameFocused="account" color={color} focused={focused} />
          ),
        }}
      />
      {/* detail screens - hidden from tab bar */}
      <Tabs.Screen
        name="stop-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="route-details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  iconBackground: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
