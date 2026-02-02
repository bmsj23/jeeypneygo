import { supabase } from '../services/supabase';

export interface UploadAvatarResult {
  url: string | null;
  error: Error | null;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/[\s=]/g, '');

  const len = cleanBase64.length;
  const bytes = new Uint8Array(Math.floor((len * 3) / 4));

  let byteIndex = 0;
  for (let i = 0; i < len; i += 4) {
    const a = BASE64_CHARS.indexOf(cleanBase64[i]);
    const b = BASE64_CHARS.indexOf(cleanBase64[i + 1]);
    const c = i + 2 < len ? BASE64_CHARS.indexOf(cleanBase64[i + 2]) : 0;
    const d = i + 3 < len ? BASE64_CHARS.indexOf(cleanBase64[i + 3]) : 0;

    bytes[byteIndex++] = (a << 2) | (b >> 4);
    if (i + 2 < len && cleanBase64[i + 2] !== '=') {
      bytes[byteIndex++] = ((b & 15) << 4) | (c >> 2);
    }
    if (i + 3 < len && cleanBase64[i + 3] !== '=') {
      bytes[byteIndex++] = ((c & 3) << 6) | d;
    }
  }

  return bytes.slice(0, byteIndex);
}

export async function uploadAvatarFromBase64(
  userId: string,
  base64Data: string,
  fileExtension: string = 'jpg'
): Promise<UploadAvatarResult> {
  try {
    if (!userId) {
      return { url: null, error: new Error('User ID is required') };
    }

    if (!base64Data || base64Data.length === 0) {
      return { url: null, error: new Error('No image data provided') };
    }

    let cleanBase64 = base64Data;
    if (base64Data.includes(',')) {
      cleanBase64 = base64Data.split(',')[1];
    }

    const contentType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `${userId}/avatar-${Date.now()}.${fileExtension}`;

    const uint8Array = base64ToUint8Array(cleanBase64);

    if (uint8Array.length === 0) {
      return { url: null, error: new Error('Failed to convert image data') };
    }

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, uint8Array, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Avatar upload error:', error.message);
      if (error.message.includes('policy')) {
        return { url: null, error: new Error('Storage permission denied. Please ensure the avatars bucket policies are configured.') };
      }
      if (error.message.includes('Bucket not found')) {
        return { url: null, error: new Error('Storage bucket "avatars" not found. Please create it in Supabase dashboard.') };
      }
      return { url: null, error: new Error(error.message) };
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error('Avatar upload exception:', error);
    const message = error instanceof Error ? error.message : 'Unknown error during upload';
    return { url: null, error: new Error(message) };
  }
}

export async function uploadAvatar(
  userId: string,
  localUri: string
): Promise<UploadAvatarResult> {
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return { url: localUri, error: null };
  }

  return {
    url: null,
    error: new Error('Local URI not supported. Use uploadAvatarFromBase64 with base64 data instead.')
  };
}
