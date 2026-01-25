import React from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const APP_VERSION = '1.7.0';
const BUILD_NUMBER = '2026.01.25';

export function LogoSection() {
  const theme = useTheme();

  return (
    <View style={styles.logoSection}>
      <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
        <MaterialCommunityIcons name="bus" size={48} color="#1A237E" />
      </View>
      <Text style={[styles.appName, { color: theme.colors.onSurface }]}>
        JeepneyGo Commuter
      </Text>
      <Text style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
        Your smart jeepney companion
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
  );
}

export function WhatsNewCard() {
  const theme = useTheme();

  return (
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
          • New trip history with fare tracking
        </Text>
        <Text style={[styles.whatsNewItem, { color: theme.colors.onSurfaceVariant }]}>
          • Improved notification settings
        </Text>
        <Text style={[styles.whatsNewItem, { color: theme.colors.onSurfaceVariant }]}>
          • Enhanced map performance
        </Text>
      </View>
    </View>
  );
}

export interface LinkItem {
  id: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

interface LinksSectionProps {
  title: string;
  links: LinkItem[];
}

export function LinksSection({ title, links }: LinksSectionProps) {
  const theme = useTheme();

  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      <View style={[styles.linksCard, { backgroundColor: theme.colors.surface }]}>
        {links.map((item, index) => (
          <React.Fragment key={item.id}>
            <Pressable style={styles.linkItem} onPress={item.onPress}>
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
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={theme.colors.onSurfaceVariant}
              />
            </Pressable>
            {index < links.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </>
  );
}

export function CreditsSection() {
  const theme = useTheme();

  return (
    <>
      <View style={[styles.creditsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name="heart" size={18} color="#EF5350" />
        <Text style={[styles.creditsText, { color: theme.colors.onSurfaceVariant }]}>
          Made with love by the JeepneyGo Team
        </Text>
      </View>
      <Text style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}>
        © 2026 JeepneyGo. All rights reserved.
      </Text>
    </>
  );
}

export function getLegalLinks(): LinkItem[] {
  return [
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
}

export function getSocialLinks(): LinkItem[] {
  return [
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
  ];
}

const styles = StyleSheet.create({
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 14,
    marginTop: 4,
  },
  versionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buildBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  buildText: {
    fontSize: 12,
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
    marginBottom: 12,
    gap: 8,
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
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    padding: 16,
    borderRadius: 16,
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
  },
});
