import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../../styles/Ingredients.styles';

/**
 * BottomActions Component
 * 
 * Purpose: Provides secondary actions at the bottom of the ingredients screen
 * 
 * Features:
 * - "Take Another Photo" button for users who want to scan additional ingredients
 * - Positioned at the bottom of the screen for easy thumb access
 * - Secondary button styling to differentiate from primary actions
 * - Consistent navigation back to camera screen
 * 
 * Use Cases:
 * - User wants to scan more ingredients from different areas
 * - Current photo didn't capture all desired ingredients
 * - User wants to start over with a new photo
 * 
 * Design Considerations:
 * - Uses secondary button styling (less prominent than primary actions)
 * - Positioned in bottom actions area for consistent UX
 * - Text clearly indicates the action that will be performed
 * 
 * @returns JSX element containing the bottom action buttons
 */
export const BottomActions: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.bottomActions}>
      {/* Secondary action button */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/CameraScreen')} // Navigate to camera for new photo
      >
        <Text style={styles.secondaryButtonText}>Take Another Photo</Text>
      </TouchableOpacity>
    </View>
  );
};