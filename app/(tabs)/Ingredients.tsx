import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

// import Components
import { IngredientsDisplay } from '../components/IngredientsScreenComponents/IngredientsDisplay';
import { RecipeSuggestions } from '../components/IngredientsScreenComponents/RecipeSuggestions';
import { EmptyState } from '../components/IngredientsScreenComponents/EmptyState';
import { BottomActions } from '../components/IngredientsScreenComponents/BottomActions';
import { useIngredientsLogic } from '../components/IngredientsScreenComponents/useIngredientsLogic';
import type { ParsedRecipe } from '../components/CameraScreenComponents/AIResponseParser';
// import Styles
import styles from '../styles/Ingredients.styles';
import { useEffect, useState } from 'react';

interface IngredientsScreenParams {
  ingredients?: string | string[];
  recipes?: string | string[];
  photoUri?: string;
  generatedImageUrl?: string;
  savedId?: string;
  detailedRecipes?: string;
}

export default function IngredientsScreen() {
  const {
    ingredients,
    recipes,
    photoUri,
    generatedImageUrl,
    savedId,
    detailedRecipes 
  } = useLocalSearchParams<IngredientsScreenParams>();



  const {
    isSaving,
    removedRecipes,
    parseArrayParam,
    getOrCreateAnimation,
    handleAddRecipe,
  } = useIngredientsLogic();

  // 🔄 State to track parsed ingredients and recipes
  const [ingredientList, setIngredientList] = useState<string[]>([]);
  const [recipeList, setRecipeList] = useState<string[]>([]);
  const [parsedDetailedRecipes, setParsedDetailedRecipes] = useState<ParsedRecipe[]>([]);

  // ✅ React to updates in navigation params
  useEffect(() => {
  const parsedIngredients = parseArrayParam(ingredients);
  const parsedRecipes = parseArrayParam(recipes);
  setIngredientList(parsedIngredients);
  setRecipeList(parsedRecipes);



  if (typeof detailedRecipes === 'string') {
    try {
      const parsed = JSON.parse(detailedRecipes);
      setParsedDetailedRecipes(parsed);
      console.log('✅ Parsed detailedRecipes in IngredientsScreen:', parsed);
    } catch (err) {
      console.error('❌ Failed to parse detailedRecipes:', err);
    }
  }
}, [ingredients, recipes, detailedRecipes]);

  // Handle empty states
  if (!ingredientList || ingredientList.length === 0) {
    return <EmptyState />;
  }

  // Filter out removed recipes to hide them immediately
  const visibleRecipes = recipeList.filter(recipe => !removedRecipes.has(recipe));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <IngredientsDisplay ingredients={ingredientList} />

        <RecipeSuggestions
          recipes={recipeList}
          visibleRecipes={visibleRecipes}
          ingredientList={ingredientList}
          removedRecipes={removedRecipes}
          getOrCreateAnimation={getOrCreateAnimation}
          onAddRecipe={(recipe) => handleAddRecipe(recipe, ingredientList)}
          isSaving={isSaving}
          detailedRecipes={parsedDetailedRecipes}
        />

        <BottomActions />
      </ScrollView>
    </SafeAreaView>
  );
}
