import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, ScreenContainer } from '@jeepneygo/ui';
import { useAuthStore } from '@jeepneygo/core';

const OTP_LENGTH = 6;

export default function OTPVerificationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const signInWithPhone = useAuthStore((state) => state.signInWithPhone);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  // countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // auto-submit when all digits entered
    if (newOtp.every((digit) => digit) && newOtp.join('').length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // handle backspace to go to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');

    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete OTP');
      return;
    }

    if (!phone) {
      setError('Phone number not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await verifyOtp(phone, code);

      if (verifyError) {
        setError(verifyError.message);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        // verification successful - navigate to main or pending approval
        router.replace('/(main)' as any);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !phone) return;

    setCanResend(false);
    setCountdown(60);
    setError(null);

    const { error: resendError } = await signInWithPhone(phone);
    if (resendError) {
      setError(resendError.message);
    }
  };

  const maskedPhone = phone
    ? phone.replace(/(\+63)(\d{3})(\d{3})(\d{4})/, '$1 $2 *** $4')
    : '';

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Verify Your Number
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter the 6-digit code sent to
        </Text>
        <Text variant="bodyLarge" style={styles.phone}>
          {maskedPhone}
        </Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <RNTextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              {
                borderColor: error
                  ? theme.colors.error
                  : digit
                  ? theme.colors.primary
                  : theme.colors.outlineVariant,
                backgroundColor: theme.colors.surface,
              },
            ]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!isLoading}
          />
        ))}
      </View>

      {error && (
        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <View style={styles.actions}>
        <Button
          mode="contained"
          size="large"
          fullWidth
          onPress={() => handleVerify()}
          loading={isLoading}
          disabled={isLoading || otp.join('').length !== OTP_LENGTH}
        >
          Verify
        </Button>

        <View style={styles.resendContainer}>
          {canResend ? (
            <Button mode="text" onPress={handleResend}>
              Resend Code
            </Button>
          ) : (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Resend code in {countdown}s
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Change Phone Number
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 48,
  },
  title: {
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 16,
  },
  subtitle: {
    color: '#757575',
  },
  phone: {
    fontWeight: '600',
    color: '#212121',
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212121',
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
  },
  actions: {
    marginTop: 16,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
});
