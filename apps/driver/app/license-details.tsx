import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Image } from 'react-native';
import { Text, useTheme, Switch } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@jeepneygo/core';

export default function LicenseDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [licenseData] = useState({
    licenseNumber: 'N01-12-345678',
    expiryDate: new Date('2027-06-15'),
    issueDate: new Date('2022-06-15'),
    licenseClass: 'Professional',
    restrictions: 'None',
    frontImageUri: null as string | null,
    backImageUri: null as string | null,
  });

  const [renewalReminder, setRenewalReminder] = useState(true);
  const [frontImageUri, setFrontImageUri] = useState<string | null>(licenseData.frontImageUri);
  const [backImageUri, setBackImageUri] = useState<string | null>(licenseData.backImageUri);

  const isExpired = licenseData.expiryDate < new Date();
  const daysUntilExpiry = Math.ceil(
    (licenseData.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;

  const handleUploadImage = async (side: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload license photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (side === 'front') {
        setFrontImageUri(result.assets[0].uri);
      } else {
        setBackImageUri(result.assets[0].uri);
      }
      // todo: upload to supabase storage in phase 7
      Alert.alert('Success', `License ${side} photo uploaded successfully.`);
    }
  };

  const renderInfoRow = (
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'],
    label: string,
    value: string,
    iconColor: string = theme.colors.primary,
    valueColor?: string
  ) => (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: valueColor || theme.colors.onSurface }]}>
          {value}
        </Text>
      </View>
    </View>
  );

  const renderImageUpload = (
    side: 'front' | 'back',
    imageUri: string | null,
    onUpload: () => void
  ) => (
    <Pressable
      onPress={onUpload}
      style={({ pressed }) => [
        styles.imageUploadCard,
        {
          backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
          borderColor: imageUri ? theme.colors.primary : theme.colors.outlineVariant,
        },
      ]}
    >
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.licenseImage} resizeMode="cover" />
          <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
            <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.imageOverlayText}>Tap to change</Text>
          </View>
        </>
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons
            name="card-account-details-outline"
            size={32}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.imagePlaceholderText, { color: theme.colors.onSurfaceVariant }]}>
            {side === 'front' ? 'Front of License' : 'Back of License'}
          </Text>
          <Text style={[styles.imagePlaceholderHint, { color: theme.colors.onSurfaceVariant }]}>
            Tap to upload
          </Text>
        </View>
      )}
      <View style={[styles.sideLabel, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.sideLabelText, { color: theme.colors.primary }]}>
          {side.toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );

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
        {/* status banner */}
        {isExpired ? (
          <View style={[styles.statusBanner, { backgroundColor: '#FFEBEE' }]}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
            <View style={styles.statusBannerText}>
              <Text style={[styles.statusBannerTitle, { color: '#F44336' }]}>License Expired</Text>
              <Text style={[styles.statusBannerSubtitle, { color: '#D32F2F' }]}>
                Please renew your license to continue driving
              </Text>
            </View>
          </View>
        ) : isExpiringSoon ? (
          <View style={[styles.statusBanner, { backgroundColor: '#FFF3E0' }]}>
            <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#F57C00" />
            <View style={styles.statusBannerText}>
              <Text style={[styles.statusBannerTitle, { color: '#F57C00' }]}>Expiring Soon</Text>
              <Text style={[styles.statusBannerSubtitle, { color: '#EF6C00' }]}>
                {daysUntilExpiry} days until expiration
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.statusBanner, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            <View style={styles.statusBannerText}>
              <Text style={[styles.statusBannerTitle, { color: '#4CAF50' }]}>License Valid</Text>
              <Text style={[styles.statusBannerSubtitle, { color: '#388E3C' }]}>
                Valid for {daysUntilExpiry} more days
              </Text>
            </View>
          </View>
        )}

        {/* license details card */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          License Information
        </Text>
        <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
          {renderInfoRow('card-account-details', 'License Number', licenseData.licenseNumber, '#1976D2')}
          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
          {renderInfoRow(
            'calendar-check',
            'Issue Date',
            licenseData.issueDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            '#7B1FA2'
          )}
          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
          {renderInfoRow(
            'calendar-clock',
            'Expiry Date',
            licenseData.expiryDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            isExpired ? '#F44336' : isExpiringSoon ? '#F57C00' : '#4CAF50',
            isExpired ? '#F44336' : isExpiringSoon ? '#F57C00' : undefined
          )}
          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
          {renderInfoRow('shield-car', 'License Class', licenseData.licenseClass, '#00897B')}
          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
          {renderInfoRow('alert-circle-outline', 'Restrictions', licenseData.restrictions, '#546E7A')}
        </View>

        {/* license photos */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>License Photos</Text>
        <View style={styles.imagesRow}>
          {renderImageUpload('front', frontImageUri, () => handleUploadImage('front'))}
          {renderImageUpload('back', backImageUri, () => handleUploadImage('back'))}
        </View>

        {/* renewal reminder */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Settings</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="bell-ring-outline"
                size={22}
                color={theme.colors.primary}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Renewal Reminder
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Get notified 90 days before expiration
                </Text>
              </View>
            </View>
            <Switch
              value={renewalReminder}
              onValueChange={setRenewalReminder}
              color={theme.colors.primary}
            />
          </View>
        </View>

        {/* info notice */}
        <View style={[styles.infoCard, { backgroundColor: '#E3F2FD' }]}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            Keep your license photos up to date. This helps verify your identity during account reviews.
          </Text>
        </View>

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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 14,
  },
  statusBannerText: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBannerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  detailsCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  imageUploadCard: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  licenseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  imagePlaceholderHint: {
    fontSize: 11,
  },
  sideLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sideLabelText: {
    fontSize: 10,
    fontWeight: '700',
  },
  settingsCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
});
