import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface MenuItem {
  id: string;
  icon: IconName;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  route?: string;
  onPress?: () => void;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

function MenuItemComponent({ item }: { item: MenuItem }) {
  const theme = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route as never);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface },
      ]}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
        <Text style={[styles.menuSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {item.subtitle}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );
}

export function MenuSection({ title, items }: MenuSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <MenuItemComponent item={item} />
            {index < items.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
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
      style={({ pressed }) => [
        styles.signOutButton,
        {
          backgroundColor: pressed ? '#FFEBEE' : theme.colors.surface,
          borderColor: '#F44336',
        },
      ]}
    >
      <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
      <Text style={styles.signOutText}>Sign Out</Text>
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
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F44336',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 13,
  },
});
