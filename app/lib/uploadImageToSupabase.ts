import { supabase } from './supabase';

/**
 * Uploads a Blob image to Supabase Storage.
 * 
 * @param blob - The image blob to upload.
 * @param recipeName - The recipe name to use for naming the image.
 * @returns {Promise<string | null>} - Public URL of uploaded image or null on failure.
 */
export const uploadImageToSupabase = async (blob: Blob, recipeName: string) => {
  try {
    if (blob.size === 0) throw new Error('Cannot upload empty image blob');

    const filePath = `recipe_images/${recipeName.replace(/\s+/g, '_').toLowerCase()}.png`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, blob, {
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
