import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@jeepneygo/ui';

interface GuestHeaderProps {
  paddingTop: number;
}

export function GuestHeader({ paddingTop }: GuestHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.guestHeader, { paddingTop: paddingTop + 24, backgroundColor: theme.colors.primary }]}>
      <View style={[styles.guestAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <MaterialCommunityIcons name="account-outline" size={48} color="#FFFFFF" />
      </View>
      <Text style={styles.guestTitle}>Guest Mode</Text>
      <Text style={styles.guestSubtitle}>Sign in to unlock all features</Text>
    </View>
  );
}

interface Feature {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: 'heart',
    iconColor: '#E91E63',
    title: 'Save Favorites',
    description: 'Quick access to your most-used stops',
  },
  {
    icon: 'bell',
    iconColor: '#4CAF50',
    title: 'Get Notifications',
    description: 'Know when your jeepney is arriving',
  },
  {
    icon: 'history',
    iconColor: '#2196F3',
    title: 'Personalized',
    description: 'Your preferences saved across devices',
  },
];

export function FeaturesCard() {
  const theme = useTheme();

  return (
    <View style={[styles.featuresCard, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.featuresTitle, { color: theme.colors.onSurface }]}>
        Why create an account?
      </Text>

      {features.map((feature) => (
        <View key={feature.title} style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: feature.iconColor + '15' }]}>
            <MaterialCommunityIcons
              name={feature.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={20}
              color={feature.iconColor}
            />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>{feature.title}</Text>
            <Text style={[styles.featureDesc, { color: theme.colors.onSurfaceVariant }]}>
              {feature.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

interface AuthButtonsProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export function AuthButtons({ onSignIn, onCreateAccount }: AuthButtonsProps) {
  return (
    <View style={styles.authButtons}>
      <Button mode="contained" onPress={onSignIn} style={styles.signInBtn}>
        Sign In
      </Button>
      <Button mode="outlined" onPress={onCreateAccount}>
        Create Account
      </Button>
    </View>
  );
}

interface GuestAppInfoProps {
  version: string;
}

export function GuestAppInfo({ version }: GuestAppInfoProps) {
  const theme = useTheme();

  return (
    <View style={styles.appInfo}>
      <Text style={[styles.appVersion, { color: theme.colors.onSurfaceVariant }]}>
        {version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
