import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { LoginMethod } from './login-tab-selector';

const COLORS = {
  primary: '#FFB800',
  surface: '#F5F5F5',
  text: '#1A1A2E',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
};

interface LoginFormProps {
  loginMethod: LoginMethod;
  phone: string;
  email: string;
  password: string;
  showPassword: boolean;
  error: string | null;
  isLoading: boolean;
  onPhoneChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onClearError: () => void;
}

export function LoginForm({
  loginMethod,
  phone,
  email,
  password,
  showPassword,
  error,
  isLoading,
  onPhoneChange,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onClearError,
}: LoginFormProps) {
  const canSubmit = loginMethod === 'phone'
    ? phone.trim().length > 0
    : email.trim().length > 0 && password.trim().length > 0;

  return (
    <View>
      <View style={styles.inputsContainer}>
        {loginMethod === 'phone' ? (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={[styles.inputWrapper, error && styles.inputError]}>
              <MaterialCommunityIcons name="phone" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(text) => {
                  onPhoneChange(text);
                  onClearError();
                }}
                keyboardType="phone-pad"
                placeholder="09XX XXX XXXX"
                placeholderTextColor={COLORS.textSecondary}
                editable={!isLoading}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, error && styles.inputError]}>
                <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    onEmailChange(text);
                    onClearError();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="driver@example.com"
                  placeholderTextColor={COLORS.textSecondary}
                  editable={!isLoading}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, error && styles.inputError]}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    onPasswordChange(text);
                    onClearError();
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textSecondary}
                  editable={!isLoading}
                />
                <Pressable onPress={onTogglePassword} hitSlop={8} style={styles.eyeButton}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <Pressable
        style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
        onPress={onSubmit}
        disabled={isLoading || !canSubmit}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.text} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {loginMethod === 'phone' ? 'Send OTP' : 'Sign In'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputsContainer: {
    gap: 12,
    marginBottom: 20,
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
  eyeButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 48,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});
