import { supabase } from './supabase';

/**
 * Converts a Blob to Uint8Array using FileReader (React Native compatible).
 */
const blobToUint8Array = (blob: Blob): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      resolve(new Uint8Array(arrayBuffer));
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export const uploadImageToSupabase = async (blob: Blob, recipeName: string) => {
  try {
    if (!blob || typeof blob.size !== 'number' || blob.size === 0) {
      throw new Error('Invalid or empty image blob');
    }

    const filePath = `recipe_images/${recipeName.replace(/\s+/g, '_').toLowerCase()}.png`;

    // ✅ Convert blob to Uint8Array using FileReader (works in React Native)
    const uint8Array = await blobToUint8Array(blob);

    console.log('📤 Uploading image to Supabase. Byte length:', uint8Array.length);

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, uint8Array, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png',
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl ?? null;
  } catch (err) {
    console.error('❌ Failed to upload image to Supabase:', err);
    return null;
  }
};
