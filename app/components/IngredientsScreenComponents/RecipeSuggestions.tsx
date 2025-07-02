/**
 * RecipeSuggestions Component
 * 
 * Purpose: Manages and displays the entire recipe suggestions section with multiple states
 * 
 * Features:
 * - Displays list of recipe cards when recipes are available
 * - Shows success message when all recipes have been added
 * - Shows empty state when no recipes are suggested
 * - Handles navigation to different screens based on user actions
 * - Manages different UI states based on recipe availability and user interactions
 * 
 * State Management:
 * - visibleRecipes: Controls which recipe cards are currently shown
 * - removedRecipes: Tracks which recipes have been added to prevent duplicates
 * - isSaving: Manages loading states across all recipe cards
 * 
 * Navigation:
 * - Routes to '/recipes' when viewing saved recipes
 * - Routes to '/CameraScreen' for retrying photo capture
 */
import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { RecipeCard } from './RecipeCard';
import styles from '../../styles/Ingredients.styles';

import { extractRecipeIngredients } from '../../lib/filteringFunctions';
import type { ParsedRecipe } from '../CameraScreenComponents/AIResponseParser';
/**
 * Props interface for the RecipeSuggestions component
 */
interface RecipeSuggestionsProps {
  recipes: string[];
  visibleRecipes: string[];
  ingredientList: string[];
  removedRecipes: Set<string>;
  getOrCreateAnimation: (name: string) => any;
  onAddRecipe: (recipeName: string) => void;
  isSaving: boolean;
  detailedRecipes?: ParsedRecipe[]; // ✅ optional prop
}

export const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({
  recipes,
  visibleRecipes,
  ingredientList,
  removedRecipes,
  getOrCreateAnimation,
  onAddRecipe,
  isSaving,
  detailedRecipes = [],
}) => {
  const router = useRouter();

  /**
   * Renders the appropriate content based on current state
   * 
   * State Logic:
   * 1. If visibleRecipes exist → Show recipe cards
   * 2. If all original recipes were removed → Show success message
   * 3. Otherwise → Show empty/retry state
   */
  const renderContent = () => {
    // State 1: Show available recipe cards
    if (visibleRecipes.length > 0) {
      return visibleRecipes.map((recipe: string, index: number) => {
        // Get or create animation instance for this specific recipe
        const animation = getOrCreateAnimation(recipe);
        const relevantIngredients = extractRecipeIngredients(recipe, ingredientList); // ✅ NEW

        const detailedRecipe = detailedRecipes.find(
          (d) => d.name?.toLowerCase() === recipe.toLowerCase()
        );


        return (
          <RecipeCard
            key={`${recipe}-${index}`} // Unique key combining recipe name and index
            recipe={recipe}
             ingredientCount={relevantIngredients.length}
            animation={animation}
            onAddRecipe={onAddRecipe}
            isSaving={isSaving}
            detailedRecipe={detailedRecipe}
          />
        );
      });
    }

    // State 2: All recipes were initially present, but now all are removed (success state)
    if (recipes.length > 0 && removedRecipes.size === recipes.length) {
      return (
        <View style={styles.allRecipesAddedContainer}>
          {/* Celebration message with emoji */}
          <Text style={styles.allRecipesAddedText}>🎉 All suggested recipes have been added!</Text>
          
          {/* Button to navigate to user's recipe collection */}
          <TouchableOpacity
            style={styles.viewRecipesButton}
            onPress={() => router.push('/recipes')}
          >
            <Text style={styles.viewRecipesButtonText}>View My Recipes</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // State 3: No recipes initially available or other edge cases
    return (
      <View style={styles.noRecipesContainer}>
        <Text style={styles.noRecipes}>No recipes suggested.</Text>
        
        {/* Button to retry the photo capture process */}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.push('/CameraScreen')}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      {/* Section header */}
      <Text style={styles.sectionTitle}>Recipe Suggestions</Text>
      
      {/* Dynamic content based on current state */}
      {renderContent()}
    </View>
  );
};