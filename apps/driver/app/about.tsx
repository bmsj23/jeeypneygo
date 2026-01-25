import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const APP_VERSION = '1.7.0';
const BUILD_NUMBER = '2025.06.01';

interface LinkItem {
  id: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export default function AboutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const legalLinks: LinkItem[] = [
    {
      id: 'terms',
      icon: 'file-document-outline',
      iconColor: '#1976D2',
      iconBg: '#E3F2FD',
      title: 'Terms of Service',
      onPress: () => Linking.openURL('https://jeepneygo.ph/terms'),
    },
    {
      id: 'privacy',
      icon: 'shield-lock-outline',
      iconColor: '#4CAF50',
      iconBg: '#E8F5E9',
      title: 'Privacy Policy',
      onPress: () => Linking.openURL('https://jeepneygo.ph/privacy'),
    },
    {
      id: 'licenses',
      icon: 'license',
      iconColor: '#7B1FA2',
      iconBg: '#F3E5F5',
      title: 'Open Source Licenses',
      onPress: () => console.log('Open licenses'),
    },
  ];

  const socialLinks: LinkItem[] = [
    {
      id: 'facebook',
      icon: 'facebook',
      iconColor: '#1877F2',
      iconBg: '#E8F4FD',
      title: 'Facebook',
      subtitle: '@jeepneygo',
      onPress: () => Linking.openURL('https://facebook.com/jeepneygo'),
    },
    {
      id: 'twitter',
      icon: 'twitter',
      iconColor: '#1DA1F2',
      iconBg: '#E8F6FE',
      title: 'Twitter',
      subtitle: '@jeepneygo_ph',
      onPress: () => Linking.openURL('https://twitter.com/jeepneygo_ph'),
    },
    {
      id: 'instagram',
      icon: 'instagram',
      iconColor: '#E4405F',
      iconBg: '#FCE8EC',
      title: 'Instagram',
      subtitle: '@jeepneygo.ph',
      onPress: () => Linking.openURL('https://instagram.com/jeepneygo.ph'),
    },
    {
      id: 'website',
      icon: 'web',
      iconColor: '#FFB800',
      iconBg: '#FFF8E1',
      title: 'Website',
      subtitle: 'jeepneygo.ph',
      onPress: () => Linking.openURL('https://jeepneygo.ph'),
    },
  ];

  const renderLinkItem = (item: LinkItem, showChevron = true) => (
    <Pressable key={item.id} style={styles.linkItem} onPress={item.onPress}>
      <View style={styles.linkLeft}>
        <View style={[styles.linkIcon, { backgroundColor: item.iconBg }]}>
          <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
        </View>
        <View>
          <Text style={[styles.linkTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
          {item.subtitle && (
            <Text style={[styles.linkSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      {showChevron && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={theme.colors.onSurfaceVariant}
        />
      )}
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'About',
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
        {/* app logo and info */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="bus" size={48} color="#1A237E" />
          </View>
          <Text style={[styles.appName, { color: theme.colors.onSurface }]}>
            JeepneyGo Driver
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
            Modern public transport management
          </Text>
          <View style={styles.versionRow}>
            <View style={[styles.versionBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
                v{APP_VERSION}
              </Text>
            </View>
            <View style={[styles.buildBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.buildText, { color: theme.colors.onSurfaceVariant }]}>
                Build {BUILD_NUMBER}
              </Text>
            </View>
          </View>
        </View>

        {/* what's new */}
        <View style={[styles.whatsNewCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.whatsNewHeader}>
            <MaterialCommunityIcons name="star-four-points" size={20} color="#1A237E" />
            <Text style={[styles.whatsNewTitle, { color: theme.colors.onSurface }]}>
              What's New in v1.7.0
            </Text>
          </View>
          <View style={styles.whatsNewList}>
            <Text style={[styles.whatsNewItem, { color: theme.colors.onSurfaceVariant }]}>
              • Redesigned profile and settings screens
            </Text>
            <Text style={[styles.whatsNewItem, { color: theme.colors.onSurfaceVariant }]}>
              • New earnings dashboard with charts
            </Text>
            <Text style={[styles.whatsNewItem, { color: theme.colors.onSurfaceVariant }]}>
              • Improved trip history filtering
            </Text>
            <Text style={[styles.whatsNewItem, { color: theme.colors.onSurfaceVariant }]}>
              • License management and reminders
            </Text>
          </View>
        </View>

        {/* legal links */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Legal</Text>
        <View style={[styles.linksCard, { backgroundColor: theme.colors.surface }]}>
          {legalLinks.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderLinkItem(item)}
              {index < legalLinks.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* social links */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Follow Us</Text>
        <View style={[styles.linksCard, { backgroundColor: theme.colors.surface }]}>
          {socialLinks.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderLinkItem(item)}
              {index < socialLinks.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* credits */}
        <View style={[styles.creditsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="heart" size={18} color="#EF5350" />
          <Text style={[styles.creditsText, { color: theme.colors.onSurfaceVariant }]}>
            Made with love by the JeepneyGo Team
          </Text>
        </View>

        <Text style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}>
          © 2026 JeepneyGo. All rights reserved.
        </Text>

        {/* bottom padding */}
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    marginBottom: 16,
  },
  versionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  versionBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buildBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  buildText: {
    fontSize: 13,
    fontWeight: '500',
  },
  whatsNewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  whatsNewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  whatsNewTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  whatsNewList: {
    gap: 6,
  },
  whatsNewItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  linksCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  linkSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  creditsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  creditsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
});
