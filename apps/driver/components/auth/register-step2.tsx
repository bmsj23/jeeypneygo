import React from 'react';
import { View, TextInput, Pressable, Image, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

const COLORS = {
  primary: '#FFB800',
  surface: '#F5F5F5',
  text: '#1A1A2E',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
};

interface RegisterStep2Props {
  licenseNumber: string;
  licenseExpiry: string;
  licensePhoto: string | null;
  errors: Record<string, string>;
  isLoading: boolean;
  onLicenseNumberChange: (text: string) => void;
  onLicenseExpiryChange: (text: string) => void;
  onTakePhoto: () => void;
  onPickImage: () => void;
  onRemovePhoto: () => void;
}

export function RegisterStep2({
  licenseNumber,
  licenseExpiry,
  licensePhoto,
  errors,
  isLoading,
  onLicenseNumberChange,
  onLicenseExpiryChange,
  onTakePhoto,
  onPickImage,
  onRemovePhoto,
}: RegisterStep2Props) {
  return (
    <Animated.View
      key="step2"
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>License Details</Text>
      <Text style={styles.stepDescription}>Provide your professional driver's license info</Text>

      <View style={styles.inputsContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>License Number</Text>
          <View style={[styles.inputWrapper, errors.licenseNumber && styles.inputError]}>
            <MaterialCommunityIcons name="card-account-details-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={licenseNumber}
              onChangeText={onLicenseNumberChange}
              placeholder="N01-23-456789"
              placeholderTextColor={COLORS.textSecondary}
              editable={!isLoading}
              autoCapitalize="characters"
            />
          </View>
          {errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>License Expiry Date</Text>
          <View style={[styles.inputWrapper, errors.licenseExpiry && styles.inputError]}>
            <MaterialCommunityIcons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={licenseExpiry}
              onChangeText={onLicenseExpiryChange}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={COLORS.textSecondary}
              editable={!isLoading}
            />
          </View>
          {errors.licenseExpiry && <Text style={styles.errorText}>{errors.licenseExpiry}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>License Photo</Text>
          {licensePhoto ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: licensePhoto }} style={styles.photoPreview} />
              <Pressable style={styles.removePhotoButton} onPress={onRemovePhoto}>
                <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.error} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <Pressable style={[styles.photoButton, { backgroundColor: COLORS.primary }]} onPress={onTakePhoto}>
                <MaterialCommunityIcons name="camera" size={20} color={COLORS.text} />
                <Text style={[styles.photoButtonText, { color: COLORS.text }]}>Take Photo</Text>
              </Pressable>
              <Pressable style={[styles.photoButton, { backgroundColor: COLORS.surface }]} onPress={onPickImage}>
                <MaterialCommunityIcons name="image" size={20} color={COLORS.textSecondary} />
                <Text style={[styles.photoButtonText, { color: COLORS.textSecondary }]}>Gallery</Text>
              </Pressable>
            </View>
          )}
          {errors.licensePhoto && <Text style={styles.errorText}>{errors.licensePhoto}</Text>}
        </View>
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={18} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Your license will be verified by our team. You'll receive a notification once approved.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  inputsContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 2,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoPreviewContainer: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    gap: 10,
    backgroundColor: '#FFF8E1',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});