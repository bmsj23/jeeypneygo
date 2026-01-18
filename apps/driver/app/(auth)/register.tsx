import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, useTheme, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, ScreenContainer } from '@jeepneygo/ui';
import { useAuthStore, supabase } from '@jeepneygo/core';

export default function DriverRegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signInWithPhone = useAuthStore((state) => state.signInWithPhone);

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    licenseNumber: '',
    address: '',
  });
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      setErrors((prev) => ({
        ...prev,
        licensePhoto: 'Permission to access photos is required',
      }));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLicensePhoto(result.assets[0].uri);
      setErrors((prev) => ({ ...prev, licensePhoto: '' }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      setErrors((prev) => ({
        ...prev,
        licensePhoto: 'Permission to access camera is required',
      }));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLicensePhoto(result.assets[0].uri);
      setErrors((prev) => ({ ...prev, licensePhoto: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Full name is required';
    }

    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Philippine phone number';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!licensePhoto) {
      newErrors.licensePhoto = 'Please upload a photo of your license';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      // format phone number
      const formattedPhone = formData.phone.startsWith('+63')
        ? formData.phone
        : formData.phone.startsWith('0')
        ? `+63${formData.phone.slice(1)}`
        : `+63${formData.phone}`;

      // send otp to verify phone
      const { error: otpError } = await signInWithPhone(formattedPhone);

      if (otpError) {
        setErrors({ phone: otpError.message });
        return;
      }

      // navigate to otp screen with registration data
      router.push({
        pathname: '/(auth)/otp',
        params: {
          phone: formattedPhone,
          isRegistration: 'true',
          displayName: formData.displayName,
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          licensePhotoUri: licensePhoto,
        },
      });
    } catch (err) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer avoidKeyboard scrollable>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Driver Registration
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Join JeepneyGo as a driver partner
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Full Name"
          value={formData.displayName}
          onChangeText={(value) => updateField('displayName', value)}
          placeholder="Juan Dela Cruz"
          left={<Input.Icon icon="account" />}
          errorMessage={errors.displayName}
          error={!!errors.displayName}
          disabled={isLoading}
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
          placeholder="09XX XXX XXXX"
          left={<Input.Icon icon="phone" />}
          errorMessage={errors.phone}
          error={!!errors.phone}
          disabled={isLoading}
        />

        <Input
          label="Driver's License Number"
          value={formData.licenseNumber}
          onChangeText={(value) => updateField('licenseNumber', value)}
          placeholder="N01-23-456789"
          left={<Input.Icon icon="card-account-details" />}
          errorMessage={errors.licenseNumber}
          error={!!errors.licenseNumber}
          disabled={isLoading}
          autoCapitalize="characters"
        />

        <Input
          label="Address (Optional)"
          value={formData.address}
          onChangeText={(value) => updateField('address', value)}
          placeholder="Lipa City, Batangas"
          left={<Input.Icon icon="map-marker" />}
          disabled={isLoading}
        />

        <View style={styles.photoSection}>
          <Text variant="titleSmall" style={styles.photoLabel}>
            Driver's License Photo
          </Text>
          <Text variant="bodySmall" style={styles.photoHint}>
            Take a clear photo of your driver's license
          </Text>

          <View style={styles.photoButtons}>
            <Button
              mode="outlined"
              onPress={takePhoto}
              icon="camera"
              style={styles.photoButton}
              disabled={isLoading}
            >
              Camera
            </Button>
            <Button
              mode="outlined"
              onPress={pickImage}
              icon="image"
              style={styles.photoButton}
              disabled={isLoading}
            >
              Gallery
            </Button>
          </View>

          {licensePhoto && (
            <View style={styles.photoPreviewContainer}>
              <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                Photo selected
              </Text>
            </View>
          )}

          {errors.licensePhoto && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.licensePhoto}
            </Text>
          )}
        </View>

        <Pressable
          style={styles.termsRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          disabled={isLoading}
        >
          <Checkbox
            status={agreedToTerms ? 'checked' : 'unchecked'}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            disabled={isLoading}
          />
          <Text variant="bodySmall" style={styles.termsText}>
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </Pressable>
        {errors.terms && (
          <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.terms}
          </Text>
        )}

        {errors.general && (
          <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.general}
          </Text>
        )}

        <Button
          mode="contained"
          size="large"
          fullWidth
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
          style={styles.registerButton}
        >
          Continue
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Already have an account?
        </Text>
        <Button mode="text" onPress={() => router.back()} compact>
          Sign In
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
  },
  subtitle: {
    color: '#757575',
  },
  form: {
    flex: 1,
  },
  photoSection: {
    marginBottom: 16,
  },
  photoLabel: {
    marginBottom: 4,
    color: '#212121',
  },
  photoHint: {
    color: '#757575',
    marginBottom: 12,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
  },
  photoPreviewContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    alignItems: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  termsText: {
    flex: 1,
    color: '#757575',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
  registerButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 4,
  },
});
