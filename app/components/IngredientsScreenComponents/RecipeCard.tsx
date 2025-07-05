import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import styles from '../../styles/Ingredients.styles';

// Add your ParsedRecipe type import if you have it:
import type { ParsedRecipe } from '../../components/CameraScreenComponents/AIResponseParser';

interface RecipeCardProps {
  recipe: string;           // Name of the recipe to display
  ingredientCount: number;  // Number of ingredients used in this recipe
  animation: Animated.Value; // Animated value for card entrance/exit animations
  onAddRecipe: (recipe: string) => void; // Callback function when user adds recipe
  isSaving: boolean;        // Loading state to disable button during save operation
  detailedRecipe?: ParsedRecipe;  // ✅ optional detailed recipe info
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  ingredientCount,
  animation,
  onAddRecipe,
  isSaving,
  detailedRecipe,
}) => {
  return (
    <Animated.View
      style={[
        styles.recipeCard,
        {
          opacity: animation,
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.recipeTitle}>{recipe}</Text>
     
      {/* Show detailed ingredients if available */}
      {detailedRecipe?.availableIngredients && detailedRecipe.availableIngredients.length > 0 && (
        <View style={{ marginVertical: 6 }}>
          <Text style={{ fontWeight: '600', marginBottom: 2 }}>Ingredients:</Text>
          {detailedRecipe.availableIngredients.map((ing, i) => (
            <Text key={i} style={{ fontSize: 13, color: '#555' }}>
              • {ing}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.recipeSubtitle}>
        Using {detailedRecipe.availableIngredients.length} ingredients
      </Text>

      <TouchableOpacity
        style={[
          styles.addButton,
          isSaving && styles.addButtonDisabled
        ]}
        onPress={() => onAddRecipe(recipe)}
        disabled={isSaving}
      >
        <Text style={styles.addButtonText}>
          {isSaving ? 'Adding...' : 'Add to My Recipes'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
