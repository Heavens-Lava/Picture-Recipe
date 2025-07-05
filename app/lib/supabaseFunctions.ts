import { supabase } from './supabase';
import openai from './openai';
import { generateRecipeImage } from './generateImage'; // Import image generation function

/**
 * Saves a recipe to the Supabase database with complete ingredient handling
 */
export const saveRecipeToSupabase = async (recipe: {
  title: string;
  recipe_name: string;
  ingredients?: string[] | null;
  instructions?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: string;
  rating?: number;
  availableIngredients?: number;
  totalIngredients?: number;
  image_url?: string | null; // Removed to store image in 'images' table
}) => {
  try {
    // 1. Check for existing recipe by name
    const { data: existing, error: checkError } = await supabase
      .from('recipes')
      .select('id')
      .eq('recipe_name', recipe.recipe_name)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing recipe:', checkError);
      return null;
    }

    if (existing) {
      console.log('Recipe already exists:', recipe.recipe_name);
      return existing;
    }

    console.log('No existing recipe found, creating a new one:', recipe.recipe_name);

    const ingredientsArray = recipe.ingredients || [];

    // 2. Generate instructions if missing or placeholder
    if (!recipe.instructions || recipe.instructions.includes('Instructions will be generated')) {
      const prompt = `Generate a complete recipe using these exact ingredients: ${ingredientsArray.join(', ')}.

Requirements:
- Use ONLY the provided ingredients - do not add or suggest any others
- Start directly with the ingredients list showing quantities
- Include a list of appropriate cooking tools needed
- Follow with numbered cooking steps
- Do not include a recipe title, introduction, or conversational phrases
- Focus on practical cooking techniques and timing
- Include specific cooking times and temperatures where relevant
- End when the dish is ready to serve

Format:
**Ingredients:**
[List with quantities]

**Tools Needed:**
[List of cooking tools/equipment]

**Instructions:**
[Numbered list of clear, actionable steps]`;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
        });

        const aiInstructions = completion.choices[0].message.content?.trim();
        recipe.instructions =
          aiInstructions || 'Instructions are not available at the moment. Please try again later.';
      } catch (err) {
        console.error('Error generating instructions with OpenAI:', err);
        recipe.instructions = 'Instructions are not available at the moment. Please try again later.';
      }
    }

    // 3. Generate recipe image
    const imageUrl = await generateRecipeImage(recipe.recipe_name); // Generate image using DALL·E

    // 4. Insert new recipe into Supabase
    const { data: recipeData, error: insertRecipeError } = await supabase
      .from('recipes')
      .insert({
        title: recipe.title,
        recipe_name: recipe.recipe_name,
        ingredients: ingredientsArray,
        instructions: recipe.instructions,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        rating: recipe.rating,
        availableIngredients: recipe.availableIngredients,
        totalIngredients: recipe.totalIngredients,
      })
      .select('*')
      .single();

    if (insertRecipeError) {
      console.error('Error saving recipe:', insertRecipeError);
      return null;
    }

    console.log('Recipe saved with ingredients:', recipe.recipe_name);

    // 5. Save image URL to the 'images' table
    if (imageUrl) {
      const { error: imageInsertError } = await supabase
        .from('images')
        .insert({
          recipe_name: recipe.recipe_name,
          url: imageUrl,
          alt_text: `Image for recipe: ${recipe.recipe_name}`,
          created_at: new Date().toISOString(),
        });

      if (imageInsertError) {
        console.error('Error saving image URL:', imageInsertError);
      } else {
        console.log('Image URL saved in images table:', imageUrl);
      }
    }

    // 6. Save ingredients separately
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      await saveIngredientsForRecipe(recipeData.id, recipe.ingredients);
    }

    return recipeData;
  } catch (err) {
    console.error('Unexpected error in saveRecipeToSupabase:', err);
    return null;
  }
};

// 🧠 Handles separate ingredients table and linking to recipe_ingredients
const saveIngredientsForRecipe = async (recipeId: string, ingredients: string[]) => {
  for (const ingredientName of ingredients) {
    try {
      const { data: existingIngredient, error: checkIngredientError } = await supabase
        .from('ingredients')
        .select('ingredient_id')
        .eq('name', ingredientName.trim())
        .maybeSingle();

      if (checkIngredientError) {
        console.error('Error checking ingredient:', checkIngredientError);
        continue;
      }

      let ingredientId;

      if (!existingIngredient) {
        const { data: newIngredient, error: insertIngredientError } = await supabase
          .from('ingredients')
          .insert({ name: ingredientName.trim() })
          .select('ingredient_id')
          .single();

        if (insertIngredientError) {
          console.error('Error inserting ingredient:', insertIngredientError);
          continue;
        }

        ingredientId = newIngredient.ingredient_id;
        console.log('Created new ingredient:', ingredientName);
      } else {
        ingredientId = existingIngredient.ingredient_id;
        console.log('Using existing ingredient:', ingredientName);
      }

      const { error: linkError } = await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: recipeId,
          ingredient_id: ingredientId,
        });

      if (linkError) {
        console.error('Error linking ingredient to recipe:', linkError);
      }
    } catch (err) {
      console.error('Error processing ingredient:', ingredientName, err);
    }
  }
};
