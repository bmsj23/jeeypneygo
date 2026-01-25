import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

const COLORS = {
  surface: '#F5F5F5',
  text: '#1A1A2E',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
};

interface RegisterStep1Props {
  displayName: string;
  phone: string;
  email: string;
  errors: Record<string, string>;
  isLoading: boolean;
  onDisplayNameChange: (text: string) => void;
  onPhoneChange: (text: string) => void;
  onEmailChange: (text: string) => void;
}

export function RegisterStep1({
  displayName,
  phone,
  email,
  errors,
  isLoading,
  onDisplayNameChange,
  onPhoneChange,
  onEmailChange,
}: RegisterStep1Props) {
  return (
    <Animated.View
      key="step1"
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>Tell us about yourself</Text>

      <View style={styles.inputsContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={[styles.inputWrapper, errors.displayName && styles.inputError]}>
            <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={onDisplayNameChange}
              placeholder="Juan Dela Cruz"
              placeholderTextColor={COLORS.textSecondary}
              editable={!isLoading}
            />
          </View>
          {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
            <MaterialCommunityIcons name="phone-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={onPhoneChange}
              keyboardType="phone-pad"
              placeholder="09XX XXX XXXX"
              placeholderTextColor={COLORS.textSecondary}
              editable={!isLoading}
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address (Optional)</Text>
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="juan@example.com"
              placeholderTextColor={COLORS.textSecondary}
              editable={!isLoading}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
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
});