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
  ProfileStats,
  MenuSection,
  SignOutButton,
  ProfileFooter,
  type MenuItem,
} from '../../components/profile';

const APP_VERSION = 'JeepneyGo Commuter v1.7.0';

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

  const accountItems: MenuItem[] = [
    {
      id: 'edit-profile',
      icon: 'account-edit',
      iconColor: '#1976D2',
      iconBg: '#E3F2FD',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      route: '/edit-profile',
    },
    {
      id: 'favorites',
      icon: 'heart',
      iconColor: '#E91E63',
      iconBg: '#FCE4EC',
      title: 'Saved Stops',
      subtitle: `${favorites.length} favorites`,
      route: '/favorites',
    },
    {
      id: 'history',
      icon: 'history',
      iconColor: '#00897B',
      iconBg: '#E0F2F1',
      title: 'Trip History',
      subtitle: 'View your past journeys',
      route: '/history',
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      id: 'notifications',
      icon: 'bell-outline',
      iconColor: '#4CAF50',
      iconBg: '#E8F5E9',
      title: 'Notifications',
      subtitle: 'Manage alerts and updates',
      route: '/notifications',
    },
    {
      id: 'language',
      icon: 'translate',
      iconColor: '#9C27B0',
      iconBg: '#F3E5F5',
      title: 'Language',
      subtitle: 'Filipino / English',
    },
    {
      id: 'appearance',
      icon: 'theme-light-dark',
      iconColor: '#FF9800',
      iconBg: '#FFF3E0',
      title: 'Appearance',
      subtitle: 'Light mode',
    },
  ];

  const supportItems: MenuItem[] = [
    {
      id: 'support',
      icon: 'help-circle-outline',
      iconColor: '#5E35B1',
      iconBg: '#EDE7F6',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      route: '/support',
    },
    {
      id: 'about',
      icon: 'information-outline',
      iconColor: '#546E7A',
      iconBg: '#ECEFF1',
      title: 'About',
      subtitle: 'App info and legal',
      route: '/about',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.authenticatedContent, { paddingBottom: insets.bottom + 8 }]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <ProfileHeader user={user} paddingTop={insets.top} />
      <ProfileStats isLoading={false} favoritesCount={favorites.length} tripsCount={0} />
      <MenuSection title="Account" items={accountItems} />
      <MenuSection title="Settings" items={settingsItems} />
      <MenuSection title="Support" items={supportItems} />
      <SignOutButton onSignOut={handleSignOut} />
      <ProfileFooter version={APP_VERSION} />
    </ScrollView>
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
  authenticatedContent: {
    flexGrow: 1,
  },
});
