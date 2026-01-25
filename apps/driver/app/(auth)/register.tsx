import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@jeepneygo/core';
import {
  RegisterHeader,
  RegisterStep1,
  RegisterStep2,
  RegisterStep3,
  RegisterFooter,
} from '../../components/auth';

const COLORS = {
  background: '#FFFFFF',
};

type Step = 1 | 2 | 3;

interface FormData {
  displayName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
}

export default function DriverRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signInWithPhone = useAuthStore((state) => state.signInWithPhone);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
  });
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrors((prev) => ({ ...prev, licensePhoto: 'Permission required' }));
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
      setErrors((prev) => ({ ...prev, licensePhoto: 'Permission required' }));
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

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }

    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Philippine phone number';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.licenseExpiry.trim()) {
      newErrors.licenseExpiry = 'License expiry date is required';
    }

    if (!licensePhoto) {
      newErrors.licensePhoto = 'Please upload your license photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    if (!agreedToTerms) {
      setErrors({ terms: 'You must agree to the terms and conditions' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      router.back();
    }
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      const formattedPhone = formData.phone.startsWith('+63')
        ? formData.phone
        : formData.phone.startsWith('0')
        ? `+63${formData.phone.slice(1)}`
        : `+63${formData.phone}`;

      const { error: signInError } = await signInWithPhone(formattedPhone);

      if (signInError) {
        setErrors({ general: signInError.message });
      } else {
        router.push({
          pathname: '/(auth)/otp',
          params: {
            phone: formattedPhone,
            isNewUser: 'true',
            displayName: formData.displayName,
          },
        });
      }
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <RegisterHeader currentStep={currentStep} onBack={handleBack} />

          {currentStep === 1 && (
            <RegisterStep1
              displayName={formData.displayName}
              phone={formData.phone}
              email={formData.email}
              errors={errors}
              isLoading={isLoading}
              onDisplayNameChange={(text) => updateField('displayName', text)}
              onPhoneChange={(text) => updateField('phone', text)}
              onEmailChange={(text) => updateField('email', text)}
            />
          )}

          {currentStep === 2 && (
            <RegisterStep2
              licenseNumber={formData.licenseNumber}
              licenseExpiry={formData.licenseExpiry}
              licensePhoto={licensePhoto}
              errors={errors}
              isLoading={isLoading}
              onLicenseNumberChange={(text) => updateField('licenseNumber', text)}
              onLicenseExpiryChange={(text) => updateField('licenseExpiry', text)}
              onTakePhoto={takePhoto}
              onPickImage={pickImage}
              onRemovePhoto={() => setLicensePhoto(null)}
            />
          )}

          {currentStep === 3 && (
            <RegisterStep3
              displayName={formData.displayName}
              phone={formData.phone}
              licenseNumber={formData.licenseNumber}
              agreedToTerms={agreedToTerms}
              errors={errors}
              onToggleTerms={() => setAgreedToTerms(!agreedToTerms)}
            />
          )}

          <RegisterFooter
            currentStep={currentStep}
            isLoading={isLoading}
            onContinue={handleNext}
            onRegister={handleRegister}
            onSignIn={() => router.push('/(auth)/login')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
});
