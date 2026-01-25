import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';

const COLORS = {
  primary: '#FFB800',
  text: '#1A1A2E',
  textSecondary: '#757575',
};

interface RegisterFooterProps {
  currentStep: 1 | 2 | 3;
  isLoading: boolean;
  onContinue: () => void;
  onRegister: () => void;
  onSignIn: () => void;
}

export function RegisterFooter({
  currentStep,
  isLoading,
  onContinue,
  onRegister,
  onSignIn,
}: RegisterFooterProps) {
  return (
    <View style={styles.footerButtons}>
      {currentStep < 3 ? (
        <Pressable style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.primaryButton, isLoading && { opacity: 0.7 }]}
          onPress={onRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.text} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
        </Pressable>
      )}

      {currentStep === 1 && (
        <Pressable style={styles.signInLink} onPress={onSignIn}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <Text style={styles.signInTextBold}> Sign In</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footerButtons: {
    marginTop: 24,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 48,
    backgroundColor: COLORS.primary,
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
    color: COLORS.primary,
  },
});