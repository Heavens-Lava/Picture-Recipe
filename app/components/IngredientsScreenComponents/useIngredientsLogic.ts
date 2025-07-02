import { useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { saveRecipeToSupabase } from '../../lib/supabaseFunctions';
import { 
  extractRecipeIngredients,
  parseRecipeString,
} from '../../lib/filteringFunctions';
import type { ParsedRecipe } from '../CameraScreenComponents/AIResponseParser';

interface UseIngredientsLogicProps {
  detailedRecipes?: ParsedRecipe[];
}

/**
 * Custom React hook that manages ingredients and recipe saving logic
 * Accepts optional detailedRecipes to replace ingredient extraction logic
 */
export const useIngredientsLogic = ({ detailedRecipes = [] }: UseIngredientsLogicProps = {}) => {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [removedRecipes, setRemovedRecipes] = useState<Set<string>>(new Set());
  const [recipeAnimations] = useState<Map<string, Animated.Value>>(() => new Map());

  const parseArrayParam = (param: string | string[] | undefined): string[] => {
    if (param === undefined || param === null) return [];
    if (Array.isArray(param)) {
      return param.map(item => String(item).trim()).filter(item => item.length > 0);
    }
    if (typeof param === 'string') {
      try {
        const parsed = JSON.parse(param);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).trim()).filter(item => item.length > 0);
        }
      } catch {
        return param.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
    }
    return [];
  };

  const getOrCreateAnimation = (recipe: string): Animated.Value => {
    if (!recipeAnimations.has(recipe)) {
      recipeAnimations.set(recipe, new Animated.Value(1));
    }
    return recipeAnimations.get(recipe)!;
  };

  const animateRecipeRemoval = (recipe: string) => {
    const animation = getOrCreateAnimation(recipe);
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setRemovedRecipes(prev => new Set([...prev, recipe]));
    });
  };

  /**
   * Adds recipe to Supabase with filtering ingredients.
   * Uses detailedRecipes to get ingredients if available, else fallback to extractRecipeIngredients.
   */
  const handleAddRecipe = async (recipe: string, allFridgeIngredients: string[]) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // Find detailed recipe matching the recipe name
      const detailedRecipe = detailedRecipes.find(
        (d) => d.name.toLowerCase() === recipe.toLowerCase()
      );

      // Use detailedRecipe's availableIngredients if found, else fallback extraction
      const relevantIngredients = detailedRecipe?.availableIngredients.length
        ? detailedRecipe.availableIngredients
        : extractRecipeIngredients(recipe, allFridgeIngredients);

      const { recipeName, description } = parseRecipeString(recipe);

const recipeData = {
  title: recipeName,
  recipe_name: recipeName,
  ingredients: relevantIngredients,
  instructions: description || 'Instructions will be generated when you view the recipe.',
  cookTime: '15-30 min',             // camelCase here
  servings: 2,
  difficulty: 'Easy',
  rating: 4,
  availableIngredients: relevantIngredients.length, // camelCase here
  totalIngredients: relevantIngredients.length,     // camelCase here
  created_at: new Date().toISOString(),             // if your DB uses snake_case, you can rename here or handle in DB
};


      const result = await saveRecipeToSupabase(recipeData);

      if (result) {

      console.log("detailedRecipe:", detailedRecipe);
      console.log("Lets see: ",detailedRecipe?.availableIngredients);
      console.log( "relevantIngredients-----------",relevantIngredients.length);

        animateRecipeRemoval(recipe);
        Alert.alert(
          'Success',
          `Recipe "${recipeName}" added to your recipes!\n\nUsing ${relevantIngredients.length} ingredients from your fridge.`,
          [
            { text: 'View Recipes', onPress: () => router.push('/recipes') },
            { text: 'Stay Here', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Info', `Recipe "${recipeName}" may already exist or could not be saved.`);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save the recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    removedRecipes,
    parseArrayParam,
    getOrCreateAnimation,
    handleAddRecipe,
  };
};
