import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from '../../styles/Ingredients.styles';

/**
 * EmptyState Component
 * 
 * Purpose: Displays a user-friendly message when no ingredients are detected from the photo
 * 
 * Features:
 * - Full-screen centered layout using SafeAreaView for proper device handling
 * - Clear messaging explaining why this state occurred
 * - Call-to-action button to retry the photo capture process
 * - Consistent styling with the rest of the app
 * 
 * When This Component Shows:
 * - No ingredients were detected from the captured photo
 * - Photo analysis returned empty results
 * - Navigation params don't contain ingredient data
 * 
 * User Actions:
 * - "Take Photo" button navigates back to camera screen
 * - Encourages user to try again with better photo conditions
 * 
 * @returns JSX element containing the empty state UI
 */
export const EmptyState: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered container for empty state content */}
      <View style={styles.centered}>
        {/* Primary message - explains current state */}
        <Text style={styles.title}>No ingredients detected</Text>
        
        {/* Secondary message - provides guidance on next steps */}
        <Text style={styles.subtitle}>
          Please take a photo of your fridge or pantry to get started.
        </Text>
        
        {/* Call-to-action button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/CameraScreen')} // Navigate back to camera
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};