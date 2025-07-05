// RecipesDisplay.tsx
import React from 'react';
import { View, Text } from 'react-native';

export interface RecipesDisplayProps {
  recipes: string[];
  styles: any; // You can make this more specific based on your styles
  title?: string;
}

const RecipesDisplay: React.FC<RecipesDisplayProps> = ({
  recipes,
  styles,
  title = "Suggested Recipes"
}) => {
  return (
    <View style={styles.recipesContainer}>
      <Text style={styles.recipesTitle}>{title}</Text>
      {recipes.length > 0 ? (
        recipes.map((recipe, index) => (
          <Text key={index} style={styles.recipeItem}>
            • {recipe}
          </Text>
        ))
      ) : (
        <Text style={styles.noRecipes}>No recipes suggested.</Text>
      )}
    </View>
  );
};

export default RecipesDisplay;