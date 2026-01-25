import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, useTheme, Avatar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, SectionHeader } from '@jeepneygo/ui';
import { useAuthStore, useFavorites } from '@jeepneygo/core';

interface MenuItemProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

function MenuItem({ icon, iconColor, title, subtitle, onPress, showChevron = true }: MenuItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface },
      ]}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: (iconColor || theme.colors.primary) + '15' }]}>
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={22}
          color={iconColor || theme.colors.primary}
        />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text>
        )}
      </View>
      {showChevron && (
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
      )}
    </Pressable>
  );
}

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.guestHeader, { paddingTop: insets.top + 24, backgroundColor: theme.colors.primary }]}>
          <View style={[styles.guestAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <MaterialCommunityIcons name="account-outline" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestSubtitle}>Sign in to unlock all features</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* features card */}
          <View style={[styles.featuresCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.featuresTitle, { color: theme.colors.onSurface }]}>
              Why create an account?
            </Text>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#E91E63' + '15' }]}>
                <MaterialCommunityIcons name="heart" size={20} color="#E91E63" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>Save Favorites</Text>
                <Text style={[styles.featureDesc, { color: theme.colors.onSurfaceVariant }]}>
                  Quick access to your most-used stops
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#4CAF50' + '15' }]}>
                <MaterialCommunityIcons name="bell" size={20} color="#4CAF50" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>Get Notifications</Text>
                <Text style={[styles.featureDesc, { color: theme.colors.onSurfaceVariant }]}>
                  Know when your jeepney is arriving
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#2196F3' + '15' }]}>
                <MaterialCommunityIcons name="history" size={20} color="#2196F3" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>Personalized</Text>
                <Text style={[styles.featureDesc, { color: theme.colors.onSurfaceVariant }]}>
                  Your preferences saved across devices
                </Text>
              </View>
            </View>
          </View>

          {/* action buttons */}
          <View style={styles.authButtons}>
            <Button mode="contained" onPress={() => router.push('/(auth)/login')} style={styles.signInBtn}>
              Sign In
            </Button>
            <Button mode="outlined" onPress={() => router.push('/(auth)/register')}>
              Create Account
            </Button>
          </View>

          {/* app info */}
          <View style={styles.appInfo}>
            <Text style={[styles.appVersion, { color: theme.colors.onSurfaceVariant }]}>
              JeepneyGo Commuter v1.6.0
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* profile header */}
      <View style={[styles.profileHeader, { paddingTop: insets.top + 24, backgroundColor: theme.colors.primary }]}>
        <Avatar.Text
          size={80}
          label={getInitials(user?.display_name || 'C')}
          style={styles.avatar}
          labelStyle={styles.avatarLabel}
        />
        <Text style={styles.profileName}>{user?.display_name || 'Commuter'}</Text>
        <Text style={styles.profileEmail}>{user?.email || user?.phone || ''}</Text>

        {/* stats row */}
        <View style={[styles.statsRow, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#E91E63' }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Favorites</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Trips</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>New</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Status</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <SectionHeader title="Account" />
        <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
          <MenuItem
            icon="account-edit"
            title="Edit Profile"
            subtitle="Update your information"
            onPress={() => {}}
          />
          <MenuItem
            icon="heart"
            iconColor="#E91E63"
            title="Saved Stops"
            subtitle={`${favorites.length} favorites`}
            onPress={() => router.push('/favorites')}
          />
        </View>

        <SectionHeader title="Preferences" />
        <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
          <MenuItem
            icon="bell-outline"
            iconColor="#4CAF50"
            title="Notifications"
            subtitle="Manage alerts"
            onPress={() => {}}
          />
          <MenuItem
            icon="translate"
            iconColor="#9C27B0"
            title="Language"
            subtitle="Filipino / English"
            onPress={() => {}}
          />
          <MenuItem
            icon="theme-light-dark"
            iconColor="#FF9800"
            title="Appearance"
            subtitle="Light mode"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="Support" />
        <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
          <MenuItem
            icon="help-circle-outline"
            iconColor="#2196F3"
            title="Help & Support"
            subtitle="Get assistance"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-outline"
            title="About"
            subtitle="v1.6.0"
            onPress={() => {}}
          />
        </View>

        {/* sign out */}
        <Pressable
          onPress={handleSignOut}
          style={[styles.signOutButton, { backgroundColor: theme.colors.errorContainer }]}
        >
          <MaterialCommunityIcons name="logout" size={22} color={theme.colors.error} />
          <Text style={[styles.signOutText, { color: theme.colors.error }]}>Sign Out</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
            JeepneyGo Commuter v1.6.0
          </Text>
        </View>
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
    paddingBottom: 100,
  },
  guestHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  guestAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guestSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  featuresCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  authButtons: {
    paddingHorizontal: 20,
    gap: 12,
  },
  signInBtn: {
    marginBottom: 0,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 13,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    position: 'absolute',
    bottom: -30,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    alignSelf: 'center',
  },
  menuSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
  },
});
