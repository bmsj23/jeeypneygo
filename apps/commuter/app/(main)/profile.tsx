import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useFavorites } from '@jeepneygo/core';
import {
  GuestHeader,
  FeaturesCard,
  AuthButtons,
  GuestAppInfo,
  ProfileHeader,
  MenuSection,
  SignOutButton,
  ProfileFooter,
  type MenuItem,
} from '../../components/profile';

const APP_VERSION = 'JeepneyGo Commuter v1.6.0';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);
  const { favorites } = useFavorites();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  // guest mode
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <GuestHeader paddingTop={insets.top} />
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <FeaturesCard />
          <AuthButtons
            onSignIn={() => router.push('/(auth)/login')}
            onCreateAccount={() => router.push('/(auth)/register')}
          />
          <GuestAppInfo version={APP_VERSION} />
        </ScrollView>
      </View>
    );
  }

  // authenticated user menu items
  const accountItems: MenuItem[] = [
    {
      icon: 'account-edit',
      title: 'Edit Profile',
      subtitle: 'Update your information',
      onPress: () => {},
    },
    {
      icon: 'heart',
      iconColor: '#E91E63',
      title: 'Saved Stops',
      subtitle: `${favorites.length} favorites`,
      onPress: () => router.push('/favorites'),
    },
  ];

  const preferencesItems: MenuItem[] = [
    {
      icon: 'bell-outline',
      iconColor: '#4CAF50',
      title: 'Notifications',
      subtitle: 'Manage alerts',
      onPress: () => {},
    },
    {
      icon: 'translate',
      iconColor: '#9C27B0',
      title: 'Language',
      subtitle: 'Filipino / English',
      onPress: () => {},
    },
    {
      icon: 'theme-light-dark',
      iconColor: '#FF9800',
      title: 'Appearance',
      subtitle: 'Light mode',
      onPress: () => {},
    },
  ];

  const supportItems: MenuItem[] = [
    {
      icon: 'help-circle-outline',
      iconColor: '#2196F3',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      onPress: () => {},
    },
    {
      icon: 'information-outline',
      title: 'About',
      subtitle: 'v1.6.0',
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProfileHeader
        displayName={user?.display_name || 'Commuter'}
        email={user?.email}
        phone={user?.phone}
        favoritesCount={favorites.length}
        paddingTop={insets.top}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <MenuSection title="Account" items={accountItems} />
        <MenuSection title="Preferences" items={preferencesItems} />
        <MenuSection title="Support" items={supportItems} />

        <SignOutButton onSignOut={handleSignOut} />
        <ProfileFooter version={APP_VERSION} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 100,
  },
});
