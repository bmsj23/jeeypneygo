import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer, Card } from '@jeepneygo/ui';
import { useAuthStore } from '@jeepneygo/core';

export default function PendingApprovalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleRefresh = () => {
    const initialize = useAuthStore.getState().initialize;
    initialize();
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <IconButton
            icon="clock-outline"
            size={64}
            iconColor={theme.colors.primary}
          />
        </View>

        <Text variant="headlineMedium" style={styles.title}>
          Pending Approval
        </Text>

        <Text variant="bodyLarge" style={styles.description}>
          Your driver account is under review. We'll notify you once your account has been approved.
        </Text>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Name
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {user?.display_name || 'Driver'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Status
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                  Under Review
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.stepsContainer}>
          <Text variant="titleSmall" style={styles.stepsTitle}>
            What happens next?
          </Text>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelSmall" style={{ color: '#FFFFFF' }}>1</Text>
            </View>
            <Text variant="bodySmall" style={styles.stepText}>
              Admin reviews your license and details
            </Text>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelSmall" style={{ color: '#FFFFFF' }}>2</Text>
            </View>
            <Text variant="bodySmall" style={styles.stepText}>
              You receive approval notification
            </Text>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelSmall" style={{ color: '#FFFFFF' }}>3</Text>
            </View>
            <Text variant="bodySmall" style={styles.stepText}>
              Start accepting trips!
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          size="medium"
          fullWidth
          onPress={handleRefresh}
          icon="refresh"
          style={styles.refreshButton}
        >
          Check Status
        </Button>

        <Button
          mode="text"
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  infoCard: {
    width: '100%',
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#757575',
  },
  infoValue: {
    fontWeight: '600',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepsContainer: {
    width: '100%',
  },
  stepsTitle: {
    marginBottom: 16,
    color: '#212121',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    color: '#757575',
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
  },
  refreshButton: {
    marginBottom: 8,
  },
});
