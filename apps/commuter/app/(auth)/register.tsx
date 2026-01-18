import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button, Input, ScreenContainer } from '@jeepneygo/ui';
import { useAuthStore } from '@jeepneygo/core';

export default function CommuterRegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
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
        // registration successful - navigate to main app
        router.replace('/(main)');
      }
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
          Create Account
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Join JeepneyGo to track jeepneys
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
          label="Email"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="your@email.com"
          left={<Input.Icon icon="email" />}
          errorMessage={errors.email}
          error={!!errors.email}
          disabled={isLoading}
        />

        <Input
          label="Password"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
          placeholder="At least 6 characters"
          left={<Input.Icon icon="lock" />}
          errorMessage={errors.password}
          error={!!errors.password}
          disabled={isLoading}
        />

        <Input
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          secureTextEntry
          placeholder="Re-enter your password"
          left={<Input.Icon icon="lock-check" />}
          errorMessage={errors.confirmPassword}
          error={!!errors.confirmPassword}
          disabled={isLoading}
        />

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
          Create Account
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
