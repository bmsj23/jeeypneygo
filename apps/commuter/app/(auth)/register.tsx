import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@jeepneygo/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RegisterHero,
  FormField,
  TermsCheckbox,
  RegisterButton,
  SignInLink,
} from '../../components/auth';

const COLORS = {
  background: '#FFFFFF',
  error: '#D32F2F',
};

export default function CommuterRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { error: signUpError } = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.displayName
      );

      if (signUpError) {
        setErrors({ general: signUpError.message });
      } else {
        router.replace('/(main)');
      }
    } catch (err) {
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
          <RegisterHero onBack={() => router.back()} />

          <View style={styles.inputsContainer}>
            <FormField
              label="Full Name"
              icon="account-outline"
              value={formData.displayName}
              onChangeText={(text) => updateField('displayName', text)}
              placeholder="Juan Dela Cruz"
              error={errors.displayName}
              isLoading={isLoading}
            />

            <FormField
              label="Email Address"
              icon="email-outline"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="your@email.com"
              error={errors.email}
              isLoading={isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              label="Password"
              icon="lock-outline"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              placeholder="Min 6 characters"
              error={errors.password}
              isLoading={isLoading}
              secureTextEntry
              showToggle
              isVisible={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
            />

            <FormField
              label="Confirm Password"
              icon="lock-check-outline"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
              isLoading={isLoading}
              secureTextEntry
              showToggle
              isVisible={showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>

          <TermsCheckbox
            agreed={agreedToTerms}
            onToggle={() => setAgreedToTerms(!agreedToTerms)}
            error={errors.terms}
          />

          {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

          <RegisterButton onPress={handleRegister} isLoading={isLoading} />

          <SignInLink onPress={() => router.push('/(auth)/login')} />
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
  inputsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 8,
  },
});
