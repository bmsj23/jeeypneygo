import React from 'react';
import { View, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface LicensePhotoUploadProps {
  frontImageUri: string | null;
  backImageUri: string | null;
  onFrontImageChange: (uri: string) => void;
  onBackImageChange: (uri: string) => void;
}

function ImageUploadCard({
  side,
  imageUri,
  onUpload,
}: {
  side: 'front' | 'back';
  imageUri: string | null;
  onUpload: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onUpload}
      style={({ pressed }) => [
        styles.imageUploadCard,
        {
          backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
          borderColor: imageUri ? theme.colors.primary : theme.colors.outlineVariant,
        },
      ]}
    >
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.licenseImage} resizeMode="cover" />
          <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
            <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.imageOverlayText}>Tap to change</Text>
          </View>
        </>
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons
            name="card-account-details-outline"
            size={32}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.imagePlaceholderText, { color: theme.colors.onSurfaceVariant }]}>
            {side === 'front' ? 'Front of License' : 'Back of License'}
          </Text>
          <Text style={[styles.imagePlaceholderHint, { color: theme.colors.onSurfaceVariant }]}>
            Tap to upload
          </Text>
        </View>
      )}
      <View style={[styles.sideLabel, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.sideLabelText, { color: theme.colors.primary }]}>
          {side.toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

export function LicensePhotoUpload({
  frontImageUri,
  backImageUri,
  onFrontImageChange,
  onBackImageChange,
}: LicensePhotoUploadProps) {
  const handleUploadImage = async (side: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload license photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (side === 'front') {
        onFrontImageChange(result.assets[0].uri);
      } else {
        onBackImageChange(result.assets[0].uri);
      }
      Alert.alert('Success', `License ${side} photo uploaded successfully.`);
    }
  };

  return (
    <View style={styles.imagesRow}>
      <ImageUploadCard
        side="front"
        imageUri={frontImageUri}
        onUpload={() => handleUploadImage('front')}
      />
      <ImageUploadCard
        side="back"
        imageUri={backImageUri}
        onUpload={() => handleUploadImage('back')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  imageUploadCard: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  licenseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  imagePlaceholderHint: {
    fontSize: 11,
  },
  sideLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sideLabelText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
