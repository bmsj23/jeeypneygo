import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Image } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@jeepneygo/ui';
import { useAuthStore } from '@jeepneygo/core';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera to take a profile picture.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const updateProfile = useAuthStore.getState().updateProfile;
      const { error } = await updateProfile({
        display_name: data.displayName,
        phone: data.phone || undefined,
        email: data.email || undefined,
        avatar_url: avatarUri || undefined,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
        return;
      }

      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        {/* avatar section */}
        <Pressable onPress={showImagePickerOptions} style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>{getInitials(user?.display_name || 'D')}</Text>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="camera" size={16} color="#1A237E" />
            </View>
          </View>
          <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
            Change Photo
          </Text>
        </Pressable>

        {/* form section */}
        <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Personal Information
          </Text>

          <View style={styles.formField}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Full Name</Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.displayName?.message}
                  autoCapitalize="words"
                />
              )}
            />
          </View>

          <View style={styles.formField}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Phone Number</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.phone?.message}
                  keyboardType="phone-pad"
                />
              )}
            />
          </View>

          <View style={styles.formField}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your email address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
          </View>
        </View>

        {/* info card */}
        <View style={[styles.infoCard, { backgroundColor: '#E3F2FD' }]}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            Changes to your profile will be reflected across the app after saving.
          </Text>
        </View>

        {/* save button */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || (!isDirty && !avatarUri)}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor:
                isSubmitting || (!isDirty && !avatarUri)
                  ? theme.colors.surfaceVariant
                  : pressed
                  ? '#E5A700'
                  : theme.colors.primary,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#1A237E" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="check"
                size={20}
                color={!isDirty && !avatarUri ? theme.colors.onSurfaceVariant : '#1A237E'}
              />
              <Text
                style={[
                  styles.saveButtonText,
                  { color: !isDirty && !avatarUri ? theme.colors.onSurfaceVariant : '#1A237E' },
                ]}
              >
                Save Changes
              </Text>
            </>
          )}
        </Pressable>

        {/* bottom safe area */}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A237E',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
