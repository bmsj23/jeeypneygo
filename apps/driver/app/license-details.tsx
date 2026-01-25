import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  LicenseStatusBanner,
  LicenseInfoCard,
  LicensePhotoUpload,
  LicenseSettingsCard,
  LicenseInfoNotice,
} from '../components/license';

export default function LicenseDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [licenseData] = useState({
    licenseNumber: 'N01-12-345678',
    expiryDate: new Date('2027-06-15'),
    issueDate: new Date('2022-06-15'),
    licenseClass: 'Professional',
    restrictions: 'None',
  });

  const [renewalReminder, setRenewalReminder] = useState(true);
  const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
  const [backImageUri, setBackImageUri] = useState<string | null>(null);

  const isExpired = licenseData.expiryDate < new Date();
  const daysUntilExpiry = Math.ceil(
    (licenseData.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'License Details',
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
        <LicenseStatusBanner
          isExpired={isExpired}
          isExpiringSoon={isExpiringSoon}
          daysUntilExpiry={daysUntilExpiry}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          License Information
        </Text>
        <LicenseInfoCard
          licenseData={licenseData}
          isExpired={isExpired}
          isExpiringSoon={isExpiringSoon}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>License Photos</Text>
        <LicensePhotoUpload
          frontImageUri={frontImageUri}
          backImageUri={backImageUri}
          onFrontImageChange={setFrontImageUri}
          onBackImageChange={setBackImageUri}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Settings</Text>
        <LicenseSettingsCard
          renewalReminder={renewalReminder}
          onRenewalReminderChange={setRenewalReminder}
        />

        <LicenseInfoNotice />

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
});