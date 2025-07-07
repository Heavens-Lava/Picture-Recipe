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
    // 🧠 Step 1: Generate image using DALL·E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `High quality, appetizing image of a dish called "${recipeName}". Styled like a cookbook photo.`,
      n: 1,
      size: '1024x1024',
    });

    // 🧾 Step 2: Extract the image URL
    const url = response?.data?.[0]?.url;

    if (!url) {
      console.warn('⚠️ No image URL returned from DALL·E response:', response);
      return null;
    }

    console.log('🌐 Fetching DALL·E image from:', url);

    // 📡 Step 3: Fetch the image immediately
    const fetchResponse = await fetch(url);

    console.log('🔁 Fetch response status:', fetchResponse.status);
    if (!fetchResponse.ok) {
      throw new Error(`Image fetch failed: ${fetchResponse.status}`);
    }

    const blob = await fetchResponse.blob();

    console.log('📦 Blob size:', blob.size);
    if (blob.size === 0) {
      throw new Error('Fetched image blob is 0 bytes.');
    }

    // ✅ Step 4: Return the blob and the original URL
    return { blob, url };
  } catch (error) {
    console.error('❌ DALL·E image generation or fetch error:', error);
    return null;
  }
};
