import openai from './openai'; // Import your OpenAI client

// Function to generate an image using DALL·E
export const generateRecipeImage = async (recipeName: string): Promise<string | null> => {
  try {
    console.log('Generating DALL-E image for recipe:', recipeName);
    
    // Use openai.createImage() method for image generation
    const generatedImageResponse = await openai.createImage({
      prompt: `A beautifully plated ${recipeName}, professional food photography, appetizing, well-lit, restaurant quality presentation, overhead view`,
      n: 1,
      size: '1024x1024',
      model: 'dall-e-3', // DALL-E 3 model
    });

    // Extract the image URL from the response
    const generatedImageUrl = generatedImageResponse?.data[0]?.url;

    console.log('Generated DALL-E image URL:', generatedImageUrl);

    // Return the image URL or null if not available
    return generatedImageUrl || null;
  } catch (error) {
    // Log the error and return null
    console.error('Error generating DALL-E image:', error);
    return null;
  }
};
