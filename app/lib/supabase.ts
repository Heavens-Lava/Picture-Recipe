import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig.extra.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig.extra.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Main function used in index.tsx
export const saveRecipeToSupabase = async (recipe: {
  title: string;
  ingredients: string[]; // Changed to array of strings
  instructions?: string;
}) => {
  try {
    // First, check if the recipe already exists
    const { data: existingRecipe, error: checkRecipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('recipe_name', recipe.title)
      .single();

    if (checkRecipeError) {
      console.error('Error checking for existing recipe:', checkRecipeError.message);
      return;
    }

    if (existingRecipe) {
      console.log('Recipe already exists:', recipe.title);
      return; // Don't insert if the recipe already exists
    }

    // Insert the recipe into the recipes table (without the image_url)
    const { data: recipeData, error: insertRecipeError } = await supabase
      .from('recipes')
      .insert({
        recipe_name: recipe.title,
        title: recipe.title,
        ingredients: JSON.stringify(recipe.ingredients), // You can store ingredients as JSON if needed
        instructions: recipe.instructions ?? '',
      })
      .single();

    if (insertRecipeError) {
      console.error('Error saving recipe:', insertRecipeError.message);
      return;
    }

    console.log('Recipe saved:', recipe.title);

    // Now, insert the ingredients into the `ingredients` table
    if (recipeData) {
      for (const ingredient of recipe.ingredients) {
        // Check if the ingredient exists in the ingredients table
        const { data: existingIngredient, error: checkIngredientError } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', ingredient)
          .single();

        if (checkIngredientError) {
          console.error('Error checking ingredient:', checkIngredientError.message);
          continue;
        }

        let ingredientId;
        if (!existingIngredient) {
          // If ingredient doesn't exist, insert it
          const { data: newIngredient, error: insertIngredientError } = await supabase
            .from('ingredients')
            .insert({
              name: ingredient,  // Save ingredient name
              quantity: '',       // Set quantity placeholder
              unit: '',           // Set unit placeholder
              created_at: new Date(), // Add the current timestamp
            })
            .single();

          if (insertIngredientError) {
            console.error('Error inserting ingredient:', insertIngredientError.message);
            continue;
          }

          ingredientId = newIngredient.id;
        } else {
          // Use existing ingredient ID
          ingredientId = existingIngredient.id;
        }

        // Link ingredient to the recipe in the `recipe_ingredients` table
        const { error: linkError } = await supabase
          .from('recipe_ingredients')
          .insert({
            recipe_id: recipeData.id, // Reference the saved recipe ID
            ingredient_id: ingredientId, // Reference the saved ingredient ID
          });

        if (linkError) {
          console.error('Error linking ingredient to recipe:', linkError.message);
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error in saveRecipeToSupabase:', err);
  }
};
