// lib/downloadUtils.ts
export const downloadFile = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${url}`);
    }
    const buffer = await response.arrayBuffer(); // Get the image as a buffer
    return Buffer.from(buffer); // Convert it to a Node.js Buffer
  } catch (error) {
    console.error('Error downloading the file:', error);
    throw error;
  }
};
