import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Avatar, List, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer, Card } from '@jeepneygo/ui';
import { useAuthStore } from '@jeepneygo/core';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
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
      <ScreenContainer>
        <View style={styles.guestContainer}>
          <Avatar.Icon
            size={80}
            icon="account-off"
            style={{ backgroundColor: theme.colors.surfaceVariant }}
          />
          <Text variant="headlineSmall" style={styles.guestTitle}>
            Guest Mode
          </Text>
          <Text variant="bodyMedium" style={styles.guestSubtitle}>
            Sign in to access all features
          </Text>

          <View style={styles.guestFeatures}>
            <View style={styles.featureRow}>
              <List.Icon icon="check" color={theme.colors.primary} />
              <Text variant="bodyMedium">Save favorite stops</Text>
            </View>
            <View style={styles.featureRow}>
              <List.Icon icon="check" color={theme.colors.primary} />
              <Text variant="bodyMedium">Personalized experience</Text>
            </View>
            <View style={styles.featureRow}>
              <List.Icon icon="check" color={theme.colors.primary} />
              <Text variant="bodyMedium">Trip history</Text>
            </View>
          </View>

          <Button mode="contained" size="large" fullWidth onPress={handleSignIn}>
            Sign In
          </Button>
          <Button mode="outlined" fullWidth onPress={() => router.push('/(auth)/register')} style={styles.registerButton}>
            Create Account
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={getInitials(user?.display_name || 'C')}
          style={{ backgroundColor: theme.colors.primary }}
          labelStyle={{ color: '#1A237E' }}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {user?.display_name || 'Commuter'}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email || user?.phone || 'No contact info'}
        </Text>
      </View>

      <Card style={styles.section}>
        <List.Item
          title="Edit Profile"
          description="Update your information"
          left={(props) => <List.Icon {...props} icon="account-edit" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="Saved Stops"
          description="Manage your favorite stops"
          left={(props) => <List.Icon {...props} icon="heart" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/(main)/favorites')}
          style={styles.listItem}
        />
      </Card>

      <Card style={styles.section}>
        <List.Item
          title="Notification Settings"
          description="Manage push notifications"
          left={(props) => <List.Icon {...props} icon="bell-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="Language"
          description="Filipino / English"
          left={(props) => <List.Icon {...props} icon="translate" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="Help & Support"
          description="Get help with the app"
          left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="About"
          description="App version and info"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
          style={styles.listItem}
        />
      </Card>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          icon="logout"
          fullWidth
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
        <Text variant="bodySmall" style={styles.version}>
          JeepneyGo v1.0.0
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  guestTitle: {
    fontWeight: 'bold',
    color: '#1A237E',
    marginTop: 24,
  },
  guestSubtitle: {
    color: '#757575',
    marginTop: 8,
    marginBottom: 32,
  },
  guestFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  registerButton: {
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  name: {
    fontWeight: 'bold',
    color: '#1A237E',
    marginTop: 16,
  },
  email: {
    color: '#757575',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  signOutButton: {
    borderColor: '#F44336',
  },
  version: {
    color: '#757575',
    marginTop: 16,
  },
});
