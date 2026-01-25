import React from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FFB800',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1A1A2E',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
};

interface RegisterHeroProps {
  onBack: () => void;
}

export function RegisterHero({ onBack }: RegisterHeroProps) {
  return (
    <>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </Pressable>
      </View>

      <View style={styles.heroSection}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <MaterialCommunityIcons name="account-plus" size={48} color={COLORS.primary} />
          </View>
          <View style={[styles.decorCircle1, { backgroundColor: COLORS.primary }]} />
          <View style={styles.decorCircle2} />
        </View>
        <Text style={styles.heroTitle}>Create Account</Text>
        <Text style={styles.heroTagline}>Join JeepneyGo today</Text>
      </View>
    </>
  );
}

interface FormFieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  isLoading?: boolean;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function FormField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  error,
  isLoading,
  secureTextEntry,
  showToggle,
  isVisible,
  onToggleVisibility,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FormFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          editable={!isLoading}
          secureTextEntry={secureTextEntry && !isVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {showToggle && (
          <Pressable onPress={onToggleVisibility} hitSlop={8} style={styles.eyeButton}>
            <MaterialCommunityIcons
              name={isVisible ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface TermsCheckboxProps {
  agreed: boolean;
  onToggle: () => void;
  error?: string;
}

export function TermsCheckbox({ agreed, onToggle, error }: TermsCheckboxProps) {
  return (
    <>
      <Pressable style={styles.termsRow} onPress={onToggle}>
        <View style={[styles.checkbox, agreed && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
          {agreed && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
        </View>
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Privacy Policy</Text>
        </Text>
      </Pressable>
      {error && <Text style={[styles.errorText, { marginTop: 4, marginLeft: 30 }]}>{error}</Text>}
    </>
  );
}

interface RegisterButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function RegisterButton({ onPress, isLoading, disabled }: RegisterButtonProps) {
  return (
    <Pressable
      style={[styles.primaryButton, (isLoading || disabled) && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.text} size="small" />
      ) : (
        <Text style={styles.primaryButtonText}>Create Account</Text>
      )}
    </Pressable>
  );
}

interface SignInLinkProps {
  onPress: () => void;
}

export function SignInLink({ onPress }: SignInLinkProps) {
  return (
    <Pressable style={styles.signInLink} onPress={onPress}>
      <Text style={styles.signInText}>Already have an account?</Text>
      <Text style={[styles.signInTextBold, { color: COLORS.primary }]}> Sign In</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  illustrationContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: 2,
    right: 2,
  },
  decorCircle2: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 10,
    left: 2,
    backgroundColor: '#FFE082',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  heroTagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 2,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
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
  termsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 48,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  signInLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signInText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  signInTextBold: {
    fontSize: 13,
    fontWeight: '700',
  },
});
