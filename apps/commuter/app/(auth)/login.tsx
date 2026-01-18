import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button, Input, ScreenContainer, Divider } from '@jeepneygo/ui';
import { useAuthStore } from '@jeepneygo/core';

type AuthMethod = 'email' | 'phone';

export default function CommuterLoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signInWithPhone = useAuthStore((state) => state.signInWithPhone);

  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (authMethod === 'email') {
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
      } catch (err) {
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // phone auth
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
      } catch (err) {
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGuestMode = () => {
    router.replace('/(main)');
  };

  return (
    <ScreenContainer avoidKeyboard scrollable>
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.logoText}>JG</Text>
        </View>
        <Text variant="headlineMedium" style={styles.title}>
          JeepneyGo
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track jeepneys in real-time
        </Text>
      </View>

      <View style={styles.form}>
        <SegmentedButtons
          value={authMethod}
          onValueChange={(value) => {
            setAuthMethod(value as AuthMethod);
            setError(null);
          }}
          buttons={[
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
          ]}
          style={styles.segmented}
        />

        {authMethod === 'email' ? (
          <>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
              left={<Input.Icon icon="email" />}
              disabled={isLoading}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              left={<Input.Icon icon="lock" />}
              errorMessage={error || undefined}
              error={!!error}
              disabled={isLoading}
            />
          </>
        ) : (
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="09XX XXX XXXX"
            left={<Input.Icon icon="phone" />}
            errorMessage={error || undefined}
            error={!!error}
            disabled={isLoading}
          />
        )}

        <Button
          mode="contained"
          size="large"
          fullWidth
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        >
          {authMethod === 'email' ? 'Sign In' : 'Send OTP'}
        </Button>

        <Divider text="or" />

        <Button
          mode="outlined"
          size="medium"
          fullWidth
          onPress={handleGuestMode}
          icon="account-off"
        >
          Continue as Guest
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/(auth)/register')}
          style={styles.registerLink}
        >
          Create New Account
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  title: {
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
  },
  subtitle: {
    color: '#757575',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  segmented: {
    marginBottom: 24,
  },
  registerLink: {
    marginTop: 16,
  },
});
