import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/Ingredients.styles';

/**
 * Props interface for the IngredientsDisplay component
 * @param ingredients - Array of ingredient strings to display
 */
interface IngredientsDisplayProps {
  ingredients: string[];
}

/**
 * IngredientsDisplay Component
 * 
 * Purpose: Displays a list of detected ingredients in a chip-like format
 * 
 * Features:
 * - Shows section title "Detected Ingredients"
 * - Renders each ingredient as a styled chip
 * - Handles empty state when no ingredients are provided
 * - Uses flexbox layout for responsive ingredient arrangement
 * 
 * @param ingredients - Array of ingredient names to display
 * @returns JSX element containing the ingredients section
 */
export const IngredientsDisplay: React.FC<IngredientsDisplayProps> = ({ ingredients }) => {
  return (
    <View style={styles.section}>
      {/* Section header */}
      <Text style={styles.sectionTitle}>Detected Ingredients</Text>
      
      {/* Container for ingredient chips */}
      <View style={styles.ingredientsContainer}>
        {ingredients.length > 0 ? (
          // Map through ingredients and create individual chips
          ingredients.map((item: string, index: number) => (
            <View key={index} style={styles.ingredientChip}>
              <Text style={styles.ingredientText}>{item}</Text>
            </View>
          ))
        ) : (
          // Fallback text when no ingredients are available
          <Text style={styles.noIngredients}>No ingredients found.</Text>
        )}
      </View>
    </View>
  );
};