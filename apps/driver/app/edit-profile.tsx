import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuthStore, uploadAvatarFromBase64 } from '@jeepneygo/core';
import {
  AvatarSection,
  ProfileForm,
  ProfileInfoCard,
  SaveButton,
  ProfileFormData,
} from '../components/edit-profile';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url || null);
  const [originalAvatarUri] = useState<string | null>(user?.avatar_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarChanged = avatarUri !== originalAvatarUri;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.display_name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      let finalAvatarUrl = avatarUri;

      if (avatarUri && !avatarUri.startsWith('http') && user?.id) {
        try {
          const base64 = await FileSystem.readAsStringAsync(avatarUri, {
            encoding: 'base64',
          });

          const uriParts = avatarUri.split('.');
          const extension = uriParts.length > 1 ? uriParts.pop()?.toLowerCase() : 'jpg';

          const { url, error: uploadError } = await uploadAvatarFromBase64(
            user.id,
            base64,
            extension || 'jpg'
          );

          if (uploadError) {
            console.error('Avatar upload failed:', uploadError.message);
            Alert.alert('Upload Error', uploadError.message || 'Failed to upload profile picture.');
            setIsSubmitting(false);
            return;
          }
          finalAvatarUrl = url;
        } catch (readError) {
          console.error('Failed to read image file:', readError);
          Alert.alert('Error', 'Failed to read the selected image. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const updateProfile = useAuthStore.getState().updateProfile;
      const { error } = await updateProfile({
        display_name: data.displayName,
        phone: data.phone || undefined,
        email: data.email || undefined,
        avatar_url: finalAvatarUrl || undefined,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
        return;
      }

      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Edit Profile',
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AvatarSection
          avatarUri={avatarUri}
          displayName={user?.display_name || ''}
          onImageSelected={setAvatarUri}
        />
        <ProfileForm control={control} errors={errors} />
        <ProfileInfoCard />
        <SaveButton
          onPress={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          isDisabled={!isDirty && !avatarUri}
        />
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});
