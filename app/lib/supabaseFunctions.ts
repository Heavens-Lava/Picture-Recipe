// supabaseFunctions.ts

import { supabase } from './supabase';
import openai from './openai';
import { generateRecipeImage } from './generateImage';
import { parseInstructions, ParsedInstructions } from '../components/InstructionsScreenComponents/InstructionParser';
import { uploadImageToSupabase } from './uploadImageToSupabase';

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
  image_url?: string | null;
}) => {
  try {
    // Check if the recipe already exists
    const { data: existing, error: checkError } = await supabase
      .from('recipes')
      .select('id')
      .eq('recipe_name', recipe.recipe_name)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing recipe:', checkError);
      return null;
    }

    if (existing) {
      console.log('⚠️ Recipe already exists:', recipe.recipe_name);
      return existing;
    }

    console.log('🆕 No existing recipe found, creating:', recipe.recipe_name);
    const ingredientsArray = recipe.ingredients || [];

    let parsed: ParsedInstructions = { ingredients: [], tools: [], steps: [] };

    // 🧠 Generate instructions if needed
    if (!recipe.instructions || recipe.instructions.includes('Instructions will be generated')) {
      const prompt = `You're a professional chef. Create a full cooking guide using ONLY the ingredients listed.

Ingredients: ${ingredientsArray.join(', ')}

Instructions must follow this structure:
1. **Ingredients:** (with quantities, 1 per line)
2. **Tools Needed:** (equipment, 1 per line)
3. **Instructions:** (numbered, detailed, no fluff)

Avoid introductions or extra commentary. Only provide the formatted recipe.`;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
        });

        const aiInstructionsText = completion.choices[0].message.content?.trim();
        console.log('🧾 Full AI Instructions Text:\n', aiInstructionsText);

        if (!aiInstructionsText) {
          recipe.instructions = 'Instructions not available.';
        } else {
          parsed = parseInstructions(aiInstructionsText);
          console.log('✅ Parsed Instructions (steps):\n', parsed.steps.join('\n'));

          recipe.instructions = parsed.steps.join('\n');
          recipe.ingredients = parsed.ingredients;
        }
      } catch (err) {
        console.error('❌ OpenAI error while generating instructions:', err);
        recipe.instructions = 'Instructions not available.';
      }
    }

    // 📸 Generate recipe image
    const generatedImage = await generateRecipeImage(recipe.recipe_name);

    // 💾 Upload image to Supabase Storage
    const imageUrl = generatedImage
      ? await uploadImageToSupabase(generatedImage.blob, recipe.recipe_name)
      : null;

    // 👤 Get user ID from Supabase session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      console.error('❌ User not authenticated. Cannot save recipe.');
      return null;
    }

    // 💾 Save recipe with user_id
    const { data: recipeData, error: insertRecipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: userId, // ✅ link to logged-in user
        title: recipe.title,
        recipe_name: recipe.recipe_name,
        ingredients: recipe.ingredients,
        instruction_ingredients: parsed.ingredients,
        instruction_tools: parsed.tools,
        instructions: recipe.instructions,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        rating: recipe.rating,
        availableIngredients: recipe.availableIngredients,
        totalIngredients: recipe.totalIngredients,
        image_url: imageUrl,
      })
      .select('*')
      .single();

    if (insertRecipeError) {
      console.error('❌ Error saving recipe:', insertRecipeError);
      return null;
    }

    console.log('✅ Recipe saved:', recipe.recipe_name);

    // 🔔 Create notification for new recipe added
    await createNotification(userId, 'New Recipe Unlocked', `You added a new recipe: "${recipe.recipe_name}"!`);

    // 🖼️ Save image URL metadata
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
        console.error('❌ Error saving image URL:', imageInsertError);
      } else {
        console.log('🖼️ Image URL saved:', imageUrl);
      }
    }

    // 🔗 Link ingredients to recipe
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      await saveIngredientsForRecipe(recipeData.id, recipe.ingredients);
    }

    return recipeData;
  } catch (err) {
    console.error('🔥 Unexpected error in saveRecipeToSupabase:', err);
    return null;
  }
};

const saveIngredientsForRecipe = async (recipeId: string, ingredients: string[]) => {
  for (const ingredientName of ingredients) {
    try {
      const { data: existingIngredient, error: checkIngredientError } = await supabase
        .from('ingredients')
        .select('ingredient_id')
        .eq('name', ingredientName.trim())
        .maybeSingle();

      if (checkIngredientError) {
        console.error('❌ Error checking ingredient:', checkIngredientError);
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
          console.error('❌ Error inserting ingredient:', insertIngredientError);
          continue;
        }

        ingredientId = newIngredient.ingredient_id;
        console.log('➕ Created new ingredient:', ingredientName);
      } else {
        ingredientId = existingIngredient.ingredient_id;
        console.log('✅ Using existing ingredient:', ingredientName);
      }

      const { error: linkError } = await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: recipeId,
          ingredient_id: ingredientId,
        });

      if (linkError) {
        console.error('❌ Error linking ingredient to recipe:', linkError);
      }
    } catch (err) {
      console.error('❌ Error processing ingredient:', ingredientName, err);
    }
  }
};

const createNotification = async (userId: string, title: string, message: string) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      read: false,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('❌ Error creating notification:', error);
    } else {
      console.log(`🔔 Notification created: ${title}`);
    }
  } catch (err) {
    console.error('❌ Unexpected error creating notification:', err);
  }
};
