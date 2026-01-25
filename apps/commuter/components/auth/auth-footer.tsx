import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FFB800',
  textSecondary: '#757575',
  border: '#E0E0E0',
};

interface AuthFooterProps {
  onGuestMode: () => void;
  onSignUp: () => void;
}

export function AuthFooter({ onGuestMode, onSignUp }: AuthFooterProps) {
  return (
    <>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable style={styles.guestButton} onPress={onGuestMode}>
        <MaterialCommunityIcons name="account-off-outline" size={18} color={COLORS.textSecondary} />
        <Text style={styles.guestButtonText}>Continue as Guest</Text>
      </Pressable>

      <Pressable style={styles.signUpLink} onPress={onSignUp}>
        <Text style={styles.signUpText}>Don't have an account?</Text>
        <Text style={[styles.signUpTextBold, { color: COLORS.primary }]}> Sign Up</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text style={[styles.footerLink, { color: COLORS.primary }]}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={[styles.footerLink, { color: COLORS.primary }]}>Privacy Policy</Text>
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  signUpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  signUpText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  signUpTextBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    paddingTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    fontWeight: '600',
  },
});
