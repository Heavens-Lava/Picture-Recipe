// AIResponseParser.tsx
import React from 'react';

export interface ParsedRecipe {
  name: string;
  availableIngredients: string[];
  additionalNeeded: string[];
}

export interface ParsedResponse {
  ingredients: string[];
  recipes: string[];
  detailedRecipes?: ParsedRecipe[]; // New field for detailed recipe info
}

export interface AIResponseParserProps {
  aiText: string;
  onParsed: (result: ParsedResponse) => void;
}

// Function to parse AI response and extract ingredients and recipes
export const parseAIResponse = (aiText: string): ParsedResponse => {
  let ingredientsList: string[] = [];
  let recipesList: string[] = [];
  let detailedRecipes: ParsedRecipe[] = [];

  // Clean up the response text by trimming excess whitespace
  const cleanText = aiText.trim();

  // Method 1: Parse the new structured format with "INGREDIENTS FOUND" and detailed recipes
  const ingredientsMatch = cleanText.match(/INGREDIENTS FOUND:\s*\n([\s\S]*?)(?=\n\s*RECIPES:|$)/i);
  const recipesMatch = cleanText.match(/RECIPES:\s*\n([\s\S]*)/i);

  if (ingredientsMatch && recipesMatch) {
    // Extract ingredients from "INGREDIENTS FOUND" section
    ingredientsList = ingredientsMatch[1]
      .split('\n')
      .map(line => line.replace(/^[-*•\d.\s)]+/, '').trim())
      .filter(line => line.length > 0);

    // Parse detailed recipes section
    const recipesText = recipesMatch[1];
const recipeBlocks = recipesText
  .split(/(?:\n|^)•\s*/g)
  .map(block => block.trim())
  .filter(block => block.length > 0);

    for (const block of recipeBlocks) {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      if (lines.length > 0) {
        // Extract recipe name (first line, removing bullet point)
        const recipeName = lines[0].replace(/^[-*•\d.\s)]+/, '').trim();
        // console.log(`🧾 Full block for "${recipeName}":\n`, block);

        // Extract available ingredients (bracketed OR unbracketed)
        const availableMatch = block.match(/Available ingredients:\s*(?:\[(.*?)\]|(.*?)(?:\n|$))/i);
        const availableIngredientsRaw = availableMatch
          ? (availableMatch[1] || availableMatch[2] || '')
          : '';
        const availableIngredients = availableIngredientsRaw
          .split(',')
          .map(ing => ing.trim())
          .filter(ing => ing.length > 0);

        // ✅ Log extracted available ingredients
        // console.log(`🧪 ${recipeName} - Matched Ingredients from AI:`, availableIngredients);

        // Extract additional needed ingredients (bracketed OR unbracketed)
        const additionalMatch = block.match(/Additional needed:\s*(?:\[(.*?)\]|(.*?)(?:\n|$))/i);
        const additionalNeededRaw = additionalMatch
          ? (additionalMatch[1] || additionalMatch[2] || '')
          : '';
        const additionalNeeded = additionalNeededRaw
          .split(',')
          .map(ing => ing.trim())
          .filter(ing => ing.length > 0);

        // Add to simple recipes list for backward compatibility
        recipesList.push(recipeName);

        // Add to detailed recipes
        detailedRecipes.push({
          name: recipeName,
          availableIngredients,
          additionalNeeded
        });
      }
    }
  }
  // Method 2: Fallback to original parsing logic for backward compatibility
  else {
    const ingredientsHeaderMatch = cleanText.match(/(?:^|\n)\s*(?:ingredients?|items?|food items?|visible items?)[\s:]*\n([\s\S]*?)(?=\n\s*(?:recipes?|suggestions?|meal ideas?|cooking ideas?)[\s:]*\n|$)/i);
    const recipesHeaderMatch = cleanText.match(/(?:^|\n)\s*(?:recipes?|suggestions?|meal ideas?|cooking ideas?)[\s:]*\n([\s\S]*)/i);

    if (ingredientsHeaderMatch && recipesHeaderMatch) {
      // Extract ingredients and recipes from the matched sections
      ingredientsList = ingredientsHeaderMatch[1]
        .split('\n')
        .map(line => line.replace(/^[-*•\d.\s)]+/, '').trim())
        .filter(line => line.length > 0 && !line.match(/^(?:recipes?|suggestions?|meal ideas?)/i));

      recipesList = recipesHeaderMatch[1]
        .split('\n')
        .map(line => line.replace(/^[-*•\d.\s)]+/, '').trim())
        .filter(line => line.length > 0);
    }
    // Method 3: Enhanced fallback detection
    else {
      const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      let currentSection: 'ingredients' | 'recipes' | 'unknown' = 'unknown';
      let foundRecipeSection = false;

      for (let line of lines) {
        const lowerLine = line.toLowerCase();

        // Detect section headers based on text content
        if (lowerLine.match(/^(?:ingredients?|items?|food items?|visible items?|ingredients found)[\s:]*$/)) {
          currentSection = 'ingredients';
          continue;
        } else if (lowerLine.match(/^(?:recipes?|suggestions?|meal ideas?|cooking ideas?)[\s:]*$/)) {
          currentSection = 'recipes';
          foundRecipeSection = true;
          continue;
        }

        // Process list items that might be ingredients or recipes
        if (line.match(/^[-*•\d.\s)]/)) {
          const cleanedLine = line.replace(/^[-*•\d.\s)]+/, '').trim();

          // Skip lines that look like recipe details (available ingredients, additional needed)
          if (cleanedLine.toLowerCase().includes('available ingredients:') ||
              cleanedLine.toLowerCase().includes('additional needed:')) {
            continue;
          }

          if (currentSection === 'ingredients') {
            ingredientsList.push(cleanedLine);
          } else if (currentSection === 'recipes') {
            recipesList.push(cleanedLine);
          } else {
            // Default to ingredients if no clear section was identified yet
            if (!foundRecipeSection) {
              ingredientsList.push(cleanedLine);
            } else {
              recipesList.push(cleanedLine);
            }
          }
        }
        // Handle lines that indicate a section change (like 'recipe' or 'can make')
        else if (lowerLine.includes('recipe') || lowerLine.includes('suggestion') || lowerLine.includes('can make')) {
          foundRecipeSection = true;
          currentSection = 'recipes';

          // If the line itself is a recipe suggestion, add it directly
          if (!lowerLine.match(/^(?:here are|you can make|suggested|recommended)/)) {
            recipesList.push(line);
          }
        }
      }
    }
  }

  // Method 4: Final fallback - Categorize based on keywords if no clear section was identified
  if (ingredientsList.length === 0 && recipesList.length === 0) {
    const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (let line of lines) {
      const cleanedLine = line.replace(/^[-*•\d.\s)]+/, '').trim();
      const lowerLine = cleanedLine.toLowerCase();

      // Skip section headers and recipe details
      if (lowerLine.match(/^(?:ingredients?|recipes?|suggestions?|items?|available ingredients|additional needed)[\s:]*$/) ||
          lowerLine.includes('available ingredients:') ||
          lowerLine.includes('additional needed:')) {
        continue;
      }

      // Categorize lines as either ingredients or recipes
      if (lowerLine.includes('recipe') ||
          lowerLine.includes('pasta') ||
          lowerLine.includes('salad') ||
          lowerLine.includes('soup') ||
          lowerLine.includes('sandwich') ||
          lowerLine.includes('stir') ||
          lowerLine.includes('cook') ||
          lowerLine.includes('bake') ||
          lowerLine.includes('fry') ||
          lowerLine.includes('meal') ||
          lowerLine.includes('dish')) {
        recipesList.push(cleanedLine);
      } else if (cleanedLine.length > 0) {
        ingredientsList.push(cleanedLine); // Assume it's an ingredient
      }
    }
  }

  // Clean up duplicates and empty entries
  ingredientsList = [...new Set(ingredientsList)].filter(item => item.length > 0);
  recipesList = [...new Set(recipesList)].filter(item => item.length > 0);

  // Ensure data types are correct for Supabase
  const result: ParsedResponse = {
    ingredients: ingredientsList, // Array of strings
    recipes: recipesList,         // Array of strings
    detailedRecipes: detailedRecipes.length > 0 ? detailedRecipes : undefined
  };

  // Log parsing results for debugging
  console.log('=== PARSING RESULTS ===');
  console.log('Ingredients found:', ingredientsList.length, ingredientsList);
  console.log('Recipes found:', recipesList.length, recipesList);
  console.log('Detailed recipes:', detailedRecipes.length, detailedRecipes);
  console.log('=== END PARSING RESULTS ===');

  return result;
};

// React component wrapper for the parser (if you need it as a component)
const AIResponseParser: React.FC<AIResponseParserProps> = ({ aiText, onParsed }) => {
  React.useEffect(() => {
    if (aiText) {
      const result = parseAIResponse(aiText);
      onParsed(result);
    }
  }, [aiText, onParsed]);

  return null; // This component doesn't render anything
};

export default AIResponseParser;
