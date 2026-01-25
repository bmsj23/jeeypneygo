import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@jeepneygo/core';
import {
  AuthHero,
  LoginTabSelector,
  LoginForm,
  AuthFooter,
  type LoginMethod,
} from '../../components/auth';

const COLORS = {
  background: '#FFFFFF',
};

export default function DriverLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signInWithPhone = useAuthStore((state) => state.signInWithPhone);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handlePhoneLogin = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Philippine phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

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
  };

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signInWithEmail(email, password);

      if (signInError) {
        setError(signInError.message);
      } else {
        router.replace('/(main)' as any);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (loginMethod === 'phone') {
      handlePhoneLogin();
    } else {
      handleEmailLogin();
    }
  };

  const handleTabChange = (tab: LoginMethod) => {
    setLoginMethod(tab);
    setError(null);
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
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHero
            title="JeepneyGo"
            subtitle="Driver"
            tagline="Start earning with every trip"
          />

          <LoginTabSelector activeTab={loginMethod} onTabChange={handleTabChange} />

          <LoginForm
            loginMethod={loginMethod}
            phone={phone}
            email={email}
            password={password}
            showPassword={showPassword}
            error={error}
            isLoading={isLoading}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleLogin}
            onClearError={() => setError(null)}
          />

          <AuthFooter
            questionText="Don't have an account?"
            actionText="Sign Up"
            onActionPress={() => router.push('/(auth)/register')}
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
