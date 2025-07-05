import openai from './openai';

/**
 * Generates a recipe image using DALL·E and returns the image URL.
 * 
 * @param {string} recipeName - Name of the recipe for generating the image.
 * @returns {Promise<string | null>} - The URL of the generated image or null if the image generation fails.
 */
export const generateRecipeImage = async (recipeName: string): Promise<string | null> => {
  try {
    // Call DALL·E API to generate the image
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `High quality, appetizing image of a dish called "${recipeName}". Styled like a cookbook photo.`,
      n: 1,
      size: '1024x1024',
    });

    // Log the full response to inspect its structure
    console.log('DALL·E API response:', response);

    // Ensure we have a valid URL in the response
    const url = response?.data?.[0]?.url;

    if (!url) {
      console.warn('⚠️ No image URL returned from DALL·E response:', response);
      return null;
    }

    console.log('Generated image URL:', url);
    return url; // Return the image URL
  } catch (error) {
    console.error('❌ DALL·E error:', error);
    return null; // Return null on error
  }
};
