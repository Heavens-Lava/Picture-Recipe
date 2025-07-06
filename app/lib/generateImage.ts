import openai from './openai';

/**
 * Generates a recipe image using DALL·E and returns the image blob + metadata.
 * 
 * @param {string} recipeName - Name of the recipe for generating the image.
 * @returns {Promise<{ blob: Blob; url: string } | null>} - The image blob and URL or null on failure.
 */
export const generateRecipeImage = async (
  recipeName: string
): Promise<{ blob: Blob; url: string } | null> => {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `High quality, appetizing image of a dish called "${recipeName}". Styled like a cookbook photo.`,
      n: 1,
      size: '1024x1024',
    });

    const url = response?.data?.[0]?.url;

    if (!url) {
      console.warn('⚠️ No image URL returned from DALL·E response:', response);
      return null;
    }

    console.log('🌐 Fetching DALL·E image from:', url);
    const fetchResponse = await fetch(url);

    if (!fetchResponse.ok) {
      throw new Error(`Image fetch failed: ${fetchResponse.status}`);
    }

    const blob = await fetchResponse.blob();

    if (blob.size === 0) {
      throw new Error('Fetched image blob is 0 bytes.');
    }

    console.log('📦 DALL·E image blob size:', blob.size);
    return { blob, url };
  } catch (error) {
    console.error('❌ DALL·E image generation or fetch error:', error);
    return null;
  }
};
