import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { IngredientsDisplay } from '../components/IngredientsScreenComponents/IngredientsDisplay';
import { RecipeSuggestions } from '../components/IngredientsScreenComponents/RecipeSuggestions';
import { EmptyState } from '../components/IngredientsScreenComponents/EmptyState';
import { BottomActions } from '../components/IngredientsScreenComponents/BottomActions';

import { useIngredientsLogic } from '../components/IngredientsScreenComponents/useIngredientsLogic';
import type { ParsedRecipe } from '../components/CameraScreenComponents/AIResponseParser';
import styles from '../styles/Ingredients.styles';

interface IngredientsScreenParams {
  ingredients?: string | string[];
  recipes?: string | string[];
  photoUri?: string;
  generatedImageUrl?: string;
  savedId?: string;
  detailedRecipes?: string; // JSON string of ParsedRecipe[]
}

export default function IngredientsScreen() {
  const {
    ingredients,
    recipes,
    detailedRecipes,
  } = useLocalSearchParams<IngredientsScreenParams>();

  // 🔄 Local state
  const [ingredientList, setIngredientList] = useState<string[]>([]);
  const [recipeList, setRecipeList] = useState<string[]>([]);
  const [parsedDetailedRecipes, setParsedDetailedRecipes] = useState<ParsedRecipe[]>([]);

  // ✅ Run on mount/param update
  useEffect(() => {
    const parseArrayParam = (param: string | string[] | undefined): string[] => {
      if (!param) return [];
      if (Array.isArray(param)) return param.map(item => String(item).trim()).filter(Boolean);
      try {
        const parsed = JSON.parse(param);
        if (Array.isArray(parsed)) return parsed.map(item => String(item).trim()).filter(Boolean);
      } catch {}
      return param.split(',').map(item => item.trim()).filter(Boolean);
    };

    setIngredientList(parseArrayParam(ingredients));
    setRecipeList(parseArrayParam(recipes));

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

  // ✅ Use logic hook AFTER detailed recipes are set up
  const {
    isSaving,
    removedRecipes,
    getOrCreateAnimation,
    handleAddRecipe,
  } = useIngredientsLogic({ detailedRecipes: parsedDetailedRecipes });

  if (!ingredientList || ingredientList.length === 0) {
    return <EmptyState />;
  }

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
