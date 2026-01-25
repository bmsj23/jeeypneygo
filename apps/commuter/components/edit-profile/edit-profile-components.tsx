import React from 'react';
import { View, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Input } from '@jeepneygo/ui';
import * as ImagePicker from 'expo-image-picker';

interface AvatarSectionProps {
  avatarUri: string | null;
  displayName: string;
  onImageSelected: (uri: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AvatarSection({ avatarUri, displayName, onImageSelected }: AvatarSectionProps) {
  const theme = useTheme();

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
      onImageSelected(result.assets[0].uri);
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
      onImageSelected(result.assets[0].uri);
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

  return (
    <Pressable onPress={showImagePickerOptions} style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(displayName || 'C')}</Text>
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
  );
}

export interface ProfileFormData {
  displayName: string;
  phone?: string;
  email?: string;
}

interface ProfileFormProps {
  control: Control<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
}

export function ProfileForm({ control, errors }: ProfileFormProps) {
  const theme = useTheme();

  return (
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
  );
}

export function ProfileInfoCard() {
  return (
    <View style={[styles.infoCard, { backgroundColor: '#E3F2FD' }]}>
      <MaterialCommunityIcons name="information-outline" size={20} color="#1976D2" />
      <Text style={styles.infoText}>
        Changes to your profile will be reflected across the app after saving.
      </Text>
    </View>
  );
}

interface SaveButtonProps {
  onPress: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
}

export function SaveButton({ onPress, isSubmitting, isDisabled }: SaveButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || isSubmitting}
      style={({ pressed }) => [
        styles.saveButton,
        {
          backgroundColor: isDisabled ? theme.colors.surfaceVariant : theme.colors.primary,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color="#1A237E" />
      ) : (
        <>
          <MaterialCommunityIcons name="check" size={20} color="#1A237E" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
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
    color: '#1A237E',
  },
});
