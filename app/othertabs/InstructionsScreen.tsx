import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackHeader from '../components/InstructionsScreenComponents/BackHeader';
import RecipeHeader from '../components/InstructionsScreenComponents/RecipeHeader';
import IngredientsSection from '../components/InstructionsScreenComponents/IngredientsSection';
import ToolsSection from '../components/InstructionsScreenComponents/ToolsSection';
import InstructionsSection from '../components/InstructionsScreenComponents/InstructionsSection';
import { parseInstructions } from '../components/InstructionsScreenComponents/InstructionParser';
import { Recipe } from '../components/InstructionsScreenComponents/types';

export default function InstructionsScreen() {
  const params = useLocalSearchParams();
  const recipe: Recipe = JSON.parse(params.recipe as string);

  // Log recipe data to check if instructions are passed correctly
  console.log('Recipe data received in InstructionsScreen:', recipe);

  // Check if instructions are available
  if (!recipe.instructions) {
    console.log('No instructions found in recipe.');
  }

  // Parse the instructions using the utility function
  const { ingredients: aiIngredients, tools, steps } = parseInstructions(recipe.instructions || '');

  // Log parsed instructions to check if parsing is working
  console.log('Parsed Instructions:', { aiIngredients, tools, steps });

  // Use the ingredients from the recipe object or AI-generated ones
  const displayIngredients = recipe.ingredients || aiIngredients;

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <RecipeHeader
          title={recipe.recipe_name}
          imageUrl={recipe.meal_image_url || recipe.image_url}
          cookTime={recipe.cookTime}
          servings={recipe.servings}
          difficulty={recipe.difficulty}
        />

        <IngredientsSection ingredients={displayIngredients} />

        <ToolsSection tools={tools} />

        <InstructionsSection steps={steps} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  scrollContent: { 
    padding: 20 
  },
});