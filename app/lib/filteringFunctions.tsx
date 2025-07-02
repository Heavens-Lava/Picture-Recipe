/**
 * Utility functions to extract and match ingredients from recipes
 * This solves the problem of saving only relevant ingredients to the database
 */

/**
 * Extracts ingredients that are actually used in a specific recipe
 * by matching the recipe content against available fridge ingredients
 * 
 * @param recipe - The recipe string (format: "Recipe Name: Description")
 * @param availableIngredients - All ingredients available in the fridge
 * @returns Array of ingredients that are actually used in this recipe
 */
export const extractRecipeIngredients = (
  recipe: string, 
  availableIngredients: string[]
): string[] => {
  if (!recipe || !availableIngredients || availableIngredients.length === 0) {
    return [];
  }

  // Convert recipe to lowercase for better matching
  const recipeText = recipe.toLowerCase();
  const matchedIngredients: string[] = [];

  // Check each available ingredient to see if it's mentioned in the recipe
  availableIngredients.forEach(ingredient => {
    if (isIngredientInRecipe(ingredient, recipeText)) {
      matchedIngredients.push(ingredient);
    }
  });

  return matchedIngredients;
};

/**
 * Checks if a specific ingredient is mentioned in the recipe text
 * Uses fuzzy matching to handle plural forms, variations, and partial matches
 * 
 * @param ingredient - The ingredient to search for
 * @param recipeText - The recipe text (should be lowercase)
 * @returns Boolean indicating if the ingredient is found in the recipe
 */
const isIngredientInRecipe = (ingredient: string, recipeText: string): boolean => {
  const ingredientLower = ingredient.toLowerCase().trim();
  
  // Direct match
  if (recipeText.includes(ingredientLower)) {
    return true;
  }

  // Handle common variations and plurals
  const variations = generateIngredientVariations(ingredientLower);
  
  return variations.some(variation => recipeText.includes(variation));
};

/**
 * Generates common variations of an ingredient name for better matching
 * Handles plurals, common substitutions, and cooking terms
 * 
 * @param ingredient - The base ingredient name
 * @returns Array of possible variations
 */
const generateIngredientVariations = (ingredient: string): string[] => {
  const variations = [ingredient];
  
  // Handle plurals
  if (ingredient.endsWith('s')) {
    variations.push(ingredient.slice(0, -1)); // Remove 's'
  } else {
    variations.push(ingredient + 's'); // Add 's'
  }
  
  // Handle common cooking terms and variations
  const commonVariations: { [key: string]: string[] } = {
    'tomato': ['tomatoes', 'tomato paste', 'diced tomatoes', 'tomato sauce'],
    'tomatoes': ['tomato', 'tomato paste', 'diced tomatoes', 'tomato sauce'],
    'onion': ['onions', 'yellow onion', 'white onion', 'red onion'],
    'onions': ['onion', 'yellow onion', 'white onion', 'red onion'],
    'chicken': ['chicken breast', 'chicken thigh', 'chicken leg', 'poultry'],
    'beef': ['ground beef', 'beef steak', 'beef roast'],
    'potato': ['potatoes', 'russet potato', 'red potato'],
    'potatoes': ['potato', 'russet potato', 'red potato'],
    'cheese': ['cheddar cheese', 'mozzarella cheese', 'parmesan cheese'],
    'milk': ['whole milk', 'skim milk', '2% milk'],
    'oil': ['olive oil', 'vegetable oil', 'cooking oil'],
    'salt': ['sea salt', 'table salt', 'kosher salt'],
    'pepper': ['black pepper', 'white pepper', 'ground pepper'],
    'egg': ['eggs', 'large egg', 'chicken egg'],
    'eggs': ['egg', 'large egg', 'chicken egg'],
    'flour': ['all-purpose flour', 'wheat flour'],
    'sugar': ['white sugar', 'brown sugar', 'granulated sugar'],
    'butter': ['unsalted butter', 'salted butter'],
    'garlic': ['garlic clove', 'minced garlic', 'garlic powder'],
    'rice': ['white rice', 'brown rice', 'jasmine rice'],
    'pasta': ['spaghetti', 'penne', 'macaroni', 'noodles'],
    'bread': ['white bread', 'wheat bread', 'sourdough bread'],
    'carrot': ['carrots', 'baby carrots'],
    'carrots': ['carrot', 'baby carrots']
  };
  
  // Add specific variations if they exist
  if (commonVariations[ingredient]) {
    variations.push(...commonVariations[ingredient]);
  }
  
  // Handle compound words (split by spaces and check individual words)
  if (ingredient.includes(' ')) {
    const words = ingredient.split(' ');
    words.forEach(word => {
      if (word.length > 2) { // Only add meaningful words
        variations.push(word);
      }
    });
  }
  
  return [...new Set(variations)]; // Remove duplicates
};

/**
 * Parses a recipe string to extract the recipe name and description
 * Handles the format: "Recipe Name: Description"
 * 
 * @param recipe - The full recipe string
 * @returns Object with recipeName and description
 */
export const parseRecipeString = (recipe: string): { recipeName: string; description: string } => {
  const colonIndex = recipe.indexOf(':');
  
  if (colonIndex === -1) {
    // No colon found, treat entire string as recipe name
    return {
      recipeName: recipe.trim(),
      description: ''
    };
  }
  
  return {
    recipeName: recipe.substring(0, colonIndex).trim(),
    description: recipe.substring(colonIndex + 1).trim()
  };
};

/**
 * Enhanced version of your handleAddRecipe function that filters ingredients
 * This should replace or modify your existing handleAddRecipe function
 * 
 * @param recipe - The recipe string
 * @param allFridgeIngredients - All ingredients from the fridge
 * @param saveFunction - Your existing saveRecipeToSupabase function
 */
export const handleAddRecipeWithFilteredIngredients = async (
  recipe: string,
  allFridgeIngredients: string[],
  saveFunction: (recipeData: any) => Promise<any>
) => {
  try {
    // Extract only the ingredients that are actually used in this recipe
    const relevantIngredients = extractRecipeIngredients(recipe, allFridgeIngredients);
    
    // Parse the recipe to get name and description
    const { recipeName, description } = parseRecipeString(recipe);
    
    // Create the recipe object with only the relevant ingredients
    const recipeData = {
      title: recipeName,
      recipe_name: recipeName,
      ingredients: relevantIngredients, // Only ingredients used in this recipe
      instructions: description,
      availableIngredients: relevantIngredients.length,
      totalIngredients: relevantIngredients.length,
      // Add other fields as needed
      cookTime: 'Unknown',
      servings: 1,
      difficulty: 'Medium',
      rating: 0
    };
    
    console.log('Recipe:', recipeName);
    console.log('All fridge ingredients:', allFridgeIngredients.length);
    console.log('Filtered ingredients for this recipe:', relevantIngredients);
    
    // Save to database with filtered ingredients
    return await saveFunction(recipeData);
    
  } catch (error) {
    console.error('Error in handleAddRecipeWithFilteredIngredients:', error);
    throw error;
  }
};

/**
 * Batch process multiple recipes with filtered ingredients
 * Useful if you want to save multiple recipes at once
 * 
 * @param recipes - Array of recipe strings
 * @param allFridgeIngredients - All ingredients from the fridge
 * @param saveFunction - Your existing saveRecipeToSupabase function
 * @returns Array of save results
 */
export const batchProcessRecipes = async (
  recipes: string[],
  allFridgeIngredients: string[],
  saveFunction: (recipeData: any) => Promise<any>
): Promise<any[]> => {
  const results = [];
  
  for (const recipe of recipes) {
    try {
      const result = await handleAddRecipeWithFilteredIngredients(
        recipe, 
        allFridgeIngredients, 
        saveFunction
      );
      results.push(result);
    } catch (error) {
      console.error(`Failed to process recipe: ${recipe}`, error);
      results.push(null);
    }
  }
  
  return results;
};