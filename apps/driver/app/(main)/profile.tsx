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
  const signOut = useAuthStore((state) => state.signOut);

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

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={getInitials(user?.display_name || 'D')}
          style={{ backgroundColor: theme.colors.primary }}
          labelStyle={{ color: '#1A237E' }}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {user?.display_name || 'Driver'}
        </Text>
        <Text variant="bodyMedium" style={styles.phone}>
          {user?.phone || 'No phone number'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: user?.is_approved ? '#E8F5E9' : theme.colors.primaryContainer }]}>
          <Text
            variant="labelSmall"
            style={{ color: user?.is_approved ? '#4CAF50' : theme.colors.primary }}
          >
            {user?.is_approved ? 'Verified Driver' : 'Pending Approval'}
          </Text>
        </View>
      </View>

      <Card style={styles.section}>
        <List.Item
          title="Trip History"
          description="View your past trips"
          left={(props) => <List.Icon {...props} icon="history" color={theme.colors.primary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/(main)/history')}
          style={styles.listItem}
        />
        <Divider />
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
          title="Vehicle Information"
          description="Manage your vehicle details"
          left={(props) => <List.Icon {...props} icon="bus" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="License Details"
          description="View your license information"
          left={(props) => <List.Icon {...props} icon="card-account-details" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
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
          JeepneyGo Driver v1.6.0
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  phone: {
    color: '#757575',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
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
