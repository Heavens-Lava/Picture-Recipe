import { useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { saveRecipeToSupabase } from '../../lib/supabaseFunctions';
import { 
  extractRecipeIngredients,
  parseRecipeString,
  handleAddRecipeWithFilteredIngredients 
} from '../../lib/filteringFunctions';

/**
 * Custom React hook that manages the logic for handling ingredients and recipe creation
 * Provides functionality for parsing ingredient parameters, managing animations, 
 * and saving recipes to the database with intelligent ingredient filtering
 */
export const useIngredientsLogic = () => {
  // Get router instance for navigation between screens
  const router = useRouter();
  
  // Track whether a recipe save operation is currently in progress
  const [isSaving, setIsSaving] = useState(false);
  
  // Keep track of recipes that have been removed (for UI filtering)
  // Using Set for O(1) lookup performance when checking if recipe is removed
  const [removedRecipes, setRemovedRecipes] = useState<Set<string>>(new Set());
  
  // Store animation values for each recipe (for smooth removal animations)
  // Map allows us to associate each recipe name with its animation state
  const [recipeAnimations] = useState<Map<string, Animated.Value>>(() => new Map());

  /**
   * Utility function to parse various parameter formats into a clean string array
   * Handles URL parameters that might come as arrays, JSON strings, or comma-separated values
   * 
   * @param param - The parameter to parse (could be string, array, or undefined)
   * @returns Clean array of non-empty strings
   */
  const parseArrayParam = (param: string | string[] | undefined): string[] => {
    // Handle null/undefined cases
    if (param === undefined || param === null) return [];

    // If it's already an array, clean it up and return
    if (Array.isArray(param)) {
      return param.map(item => String(item).trim()).filter(item => item.length > 0);
    }

    // If it's a string, try to parse it as JSON first
    if (typeof param === 'string') {
      try {
        const parsed = JSON.parse(param);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).trim()).filter(item => item.length > 0);
        }
      } catch (e) {
        // If JSON parsing fails, fall back to comma-separated parsing
        console.warn("Failed to parse param as JSON, trying comma-separated:", param);
        return param.split(',')
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
      }
    }
    return [];
  };

  /**
   * Gets existing animation value for a recipe or creates a new one
   * Each recipe needs its own animation value for independent fade-out effects
   * 
   * @param recipe - The recipe name to get/create animation for
   * @returns Animated.Value instance for the recipe
   */
  const getOrCreateAnimation = (recipe: string): Animated.Value => {
    if (!recipeAnimations.has(recipe)) {
      // Create new animation starting at full opacity (1)
      recipeAnimations.set(recipe, new Animated.Value(1));
    }
    return recipeAnimations.get(recipe)!;
  };

  /**
   * Triggers a smooth fade-out animation for a recipe card
   * After animation completes, marks the recipe as removed
   * 
   * @param recipe - The recipe name to animate out
   */
  const animateRecipeRemoval = (recipe: string) => {
    const animation = getOrCreateAnimation(recipe);
    
    // Animate opacity from current value to 0 over 300ms
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true, // Use native driver for better performance
    }).start(() => {
      // After animation completes, add recipe to removed set
      // This will hide it from the UI completely
      setRemovedRecipes(prev => new Set([...prev, recipe]));
    });
  };

  /**
   * UPDATED: Main function to handle adding a recipe with filtered ingredients
   * Now extracts only relevant ingredients from the full fridge inventory
   * 
   * @param recipe - The recipe string (format: "Recipe Name: Description")
   * @param allFridgeIngredients - Complete list of ingredients from fridge
   */
  const handleAddRecipe = async (recipe: string, allFridgeIngredients: string[]) => {
    // Prevent multiple simultaneous save operations
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      console.log('Processing recipe with ingredient filtering...');
      console.log('Recipe:', recipe);
      console.log('Total fridge ingredients:', allFridgeIngredients.length);
      
      // NEW: Extract only ingredients that are actually used in this recipe
      const relevantIngredients = extractRecipeIngredients(recipe, allFridgeIngredients);
      const { recipeName, description } = parseRecipeString(recipe);
      
      console.log('Filtered ingredients for this recipe:', relevantIngredients);
      console.log('Ingredients saved:', relevantIngredients.length, 'out of', allFridgeIngredients.length);
      
      // Create standardized recipe data object for database with filtered ingredients
      const recipeData = {
        title: recipeName,
        recipe_name: recipeName,
        ingredients: relevantIngredients, // Only ingredients used in this recipe
        instructions: description || 'Instructions will be generated when you view the recipe.',
        cook_time: '15-30 min',
        servings: 2,
        difficulty: 'Easy',
        rating: 4,
        available_ingredients: relevantIngredients.length,
        total_ingredients: relevantIngredients.length,
        created_at: new Date().toISOString(),
      };

      console.log('Recipe data being saved to Supabase:', recipeData);

      // Attempt to save recipe to Supabase database
      const result = await saveRecipeToSupabase(recipeData, false);
      
      if (result) {
        // Success: animate the recipe card out and show success message
        animateRecipeRemoval(recipe);
        
        // Show success alert with ingredient count information
        Alert.alert(
          'Success', 
          `Recipe "${recipeName}" added to your recipes!\n\nUsing ${relevantIngredients.length} ingredients from your fridge.`, 
          [
            {
              text: 'View Recipes',
              onPress: () => router.push('/recipes'),
            },
            {
              text: 'Stay Here',
              style: 'cancel',
            },
          ]
        );
      } else {
        // Recipe might already exist or save failed
        Alert.alert('Info', `Recipe "${recipeName}" may already exist or could not be saved.`);
      }
    } catch (error) {
      // Handle any errors during the save process
      console.error('Error saving recipe:', error);
      
      // Log detailed error information for debugging
      if (error && typeof error === 'object') {
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else {
        console.error('Error details:', error);
      }
      
      Alert.alert('Error', 'Failed to save the recipe. Please try again.');
    } finally {
      // Always reset saving state, regardless of success or failure
      setIsSaving(false);
    }
  };

  /**
   * NEW: Helper function to preview what ingredients would be filtered for a recipe
   * Useful for debugging or showing users what ingredients will be saved
   * 
   * @param recipe - The recipe string
   * @param allFridgeIngredients - Complete list of fridge ingredients
   * @returns Object with filtering preview information
   */
  const previewRecipeIngredients = (recipe: string, allFridgeIngredients: string[]) => {
    const filteredIngredients = extractRecipeIngredients(recipe, allFridgeIngredients);
    const { recipeName } = parseRecipeString(recipe);
    
    return {
      recipeName,
      filteredIngredients,
      totalFridgeIngredients: allFridgeIngredients.length,
      matchedCount: filteredIngredients.length,
      matchPercentage: Math.round((filteredIngredients.length / allFridgeIngredients.length) * 100)
    };
  };

  /**
   * NEW: Batch preview function for all recipes
   * Shows filtering results for all recipes at once
   * 
   * @param recipes - Array of recipe strings
   * @param allFridgeIngredients - Complete list of fridge ingredients
   * @returns Array of preview objects
   */
  const previewAllRecipeIngredients = (recipes: string[], allFridgeIngredients: string[]) => {
    return recipes.map(recipe => previewRecipeIngredients(recipe, allFridgeIngredients));
  };

  // Return all the stateful values and functions for use in components
  return {
    isSaving,                      // Boolean indicating if save is in progress
    removedRecipes,                // Set of recipe names that have been removed
    parseArrayParam,               // Utility function for parsing parameters
    getOrCreateAnimation,          // Function to get/create animation values
    handleAddRecipe,               // UPDATED: Main function to add recipes with filtering
    previewRecipeIngredients,      // NEW: Preview filtering for single recipe
    previewAllRecipeIngredients,   // NEW: Preview filtering for all recipes
  };
};