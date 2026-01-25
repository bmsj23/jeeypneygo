import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SectionHeader } from '@jeepneygo/ui';

export interface MenuItem {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

interface MenuItemComponentProps extends MenuItem {}

function MenuItemComponent({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  showChevron = true,
}: MenuItemComponentProps) {
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

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

export function MenuSection({ title, items }: MenuSectionProps) {
  const theme = useTheme();

  return (
    <>
      <SectionHeader title={title} />
      <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
        {items.map((item) => (
          <MenuItemComponent key={item.title} {...item} />
        ))}
      </View>
    </>
  );
}

interface SignOutButtonProps {
  onSignOut: () => void;
}

export function SignOutButton({ onSignOut }: SignOutButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onSignOut}
      style={[styles.signOutButton, { backgroundColor: theme.colors.errorContainer }]}
    >
      <MaterialCommunityIcons name="logout" size={22} color={theme.colors.error} />
      <Text style={[styles.signOutText, { color: theme.colors.error }]}>Sign Out</Text>
    </Pressable>
  );
}

interface ProfileFooterProps {
  version: string;
}

export function ProfileFooter({ version }: ProfileFooterProps) {
  const theme = useTheme();

  return (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
        {version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
