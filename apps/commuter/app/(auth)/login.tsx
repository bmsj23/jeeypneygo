import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useAuthStore } from '@jeepneygo/core';
import {
  AuthHero,
  LoginTabSelector,
  LoginForm,
  AuthFooter,
  TAB_WIDTH,
  type LoginMethod,
} from '../../components/auth';

const COLORS = {
  background: '#FFFFFF',
};

export default function CommuterLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signInWithPhone = useAuthStore((state) => state.signInWithPhone);

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const tabIndicatorPosition = useSharedValue(0);

  useEffect(() => {
    tabIndicatorPosition.value = withTiming(loginMethod === 'email' ? 0 : TAB_WIDTH, {
      duration: 200,
    });
  }, [loginMethod]);

  const handleLogin = async () => {
    setError(null);

    if (loginMethod === 'email') {
      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!password.trim()) {
        setError('Please enter your password');
        return;
      }

      setIsLoading(true);
      try {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) {
          setError(signInError.message);
        } else {
          router.replace('/(main)');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      const phoneRegex = /^(\+63|0)?9\d{9}$/;
      if (!phone.trim()) {
        setError('Please enter your phone number');
        return;
      }
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        setError('Please enter a valid Philippine phone number');
        return;
      }

      setIsLoading(true);
      try {
        const formattedPhone = phone.startsWith('+63')
          ? phone
          : phone.startsWith('0')
          ? `+63${phone.slice(1)}`
          : `+63${phone}`;

        const { error: signInError } = await signInWithPhone(formattedPhone);
        if (signInError) {
          setError(signInError.message);
        } else {
          router.push({
            pathname: '/(auth)/otp',
            params: { phone: formattedPhone },
          });
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGuestMode = () => {
    router.replace('/(main)');
  };

  const canSubmit = loginMethod === 'phone'
    ? phone.trim().length > 0
    : email.trim().length > 0 && password.trim().length > 0;

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
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHero />

          <LoginTabSelector
            loginMethod={loginMethod}
            tabIndicatorPosition={tabIndicatorPosition}
            onSelectEmail={() => {
              setLoginMethod('email');
              setError(null);
            }}
            onSelectPhone={() => {
              setLoginMethod('phone');
              setError(null);
            }}
          />

          <LoginForm
            loginMethod={loginMethod}
            email={email}
            password={password}
            phone={phone}
            showPassword={showPassword}
            error={error}
            isLoading={isLoading}
            canSubmit={canSubmit}
            onEmailChange={(text) => {
              setEmail(text);
              setError(null);
            }}
            onPasswordChange={(text) => {
              setPassword(text);
              setError(null);
            }}
            onPhoneChange={(text) => {
              setPhone(text);
              setError(null);
            }}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleLogin}
          />

          <AuthFooter
            onGuestMode={handleGuestMode}
            onSignUp={() => router.push('/(auth)/register')}
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
