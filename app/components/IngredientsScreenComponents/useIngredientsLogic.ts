import { useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { saveRecipeToSupabase } from '../../lib/supabaseFunctions';
import {
  extractRecipeIngredients,
  parseRecipeString,
} from '../../lib/filteringFunctions';
import openai from '../../lib/openai';
import { generateRecipeImage } from '../../lib/generateImage';
import type { ParsedRecipe } from '../CameraScreenComponents/AIResponseParser';

interface UseIngredientsLogicProps {
  detailedRecipes?: ParsedRecipe[];
}

/**
 * Custom React hook that manages ingredients and recipe saving logic
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
   * Generate cooking instructions using GPT-4o based on recipe name and ingredients.
   */
  const generateInstructions = async (recipeName: string, ingredients: string[]): Promise<string> => {
    try {
      const prompt = `Create clear, beginner-friendly cooking instructions for a recipe called "${recipeName}" using the following ingredients:\n\n${ingredients.join(', ')}.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating instructions:', error);
      return 'Instructions will be generated when you view the recipe.';
    }
  };

  /**
   * Adds a recipe to Supabase with AI-generated instructions and image.
   */
  const handleAddRecipe = async (recipe: string, allFridgeIngredients: string[]) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const detailedRecipe = detailedRecipes.find(
        (d) => d.name.toLowerCase() === recipe.toLowerCase()
      );

      const relevantIngredients = detailedRecipe?.availableIngredients?.length
        ? detailedRecipe.availableIngredients
        : extractRecipeIngredients(recipe, allFridgeIngredients);

      const { recipeName, description } = parseRecipeString(recipe);

      const instructions = await generateInstructions(recipeName, relevantIngredients);

      let imageUrl = detailedRecipe?.image || null;
      if (!imageUrl) {
        imageUrl = await generateRecipeImage(recipeName);
      }

      const recipeData = {
        title: recipeName,
        recipe_name: recipeName,
        ingredients: relevantIngredients,
        instructions,
        image: imageUrl,
        cookTime: '15-30 min',
        servings: 2,
        difficulty: 'Easy',
        rating: 4,
        availableIngredients: relevantIngredients.length,
        totalIngredients: relevantIngredients.length,
        created_at: new Date().toISOString(),
      };

      const result = await saveRecipeToSupabase(recipeData);

      if (result) {
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
