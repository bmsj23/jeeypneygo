import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
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

interface RegisterStep3Props {
  displayName: string;
  phone: string;
  licenseNumber: string;
  agreedToTerms: boolean;
  errors: Record<string, string>;
  onToggleTerms: () => void;
}

export function RegisterStep3({
  displayName,
  phone,
  licenseNumber,
  agreedToTerms,
  errors,
  onToggleTerms,
}: RegisterStep3Props) {
  return (
    <Animated.View
      key="step3"
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>Almost Done!</Text>
      <Text style={styles.stepDescription}>Review and confirm your registration</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="account" size={18} color={COLORS.textSecondary} />
          <Text style={styles.summaryLabel}>Name</Text>
          <Text style={styles.summaryValue}>{displayName}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="phone" size={18} color={COLORS.textSecondary} />
          <Text style={styles.summaryLabel}>Phone</Text>
          <Text style={styles.summaryValue}>{phone}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="card-account-details" size={18} color={COLORS.textSecondary} />
          <Text style={styles.summaryLabel}>License</Text>
          <Text style={styles.summaryValue}>{licenseNumber}</Text>
        </View>
      </View>

      <Pressable style={styles.termsRow} onPress={onToggleTerms}>
        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
          {agreedToTerms && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
        </View>
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </Pressable>
      {errors.terms && <Text style={[styles.errorText, { marginTop: 4 }]}>{errors.terms}</Text>}
      {errors.general && <Text style={[styles.errorText, { marginTop: 8 }]}>{errors.general}</Text>}

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="shield-check" size={18} color={COLORS.primary} />
        <Text style={styles.infoText}>
          After registration, your account will be reviewed. You can start driving once approved.
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
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 60,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 2,
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