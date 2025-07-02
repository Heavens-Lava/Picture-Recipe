// IngredientsDisplay.tsx
import React from 'react';
import { View, Text } from 'react-native';

export interface IngredientsDisplayProps {
  ingredients: string[];
  styles: any; // You can make this more specific based on your styles
  title?: string;
}

const IngredientsDisplay: React.FC<IngredientsDisplayProps> = ({
  ingredients,
  styles,
  title = "Ingredients"
}) => {
  return (
    <View style={styles.ingredientsContainer}>
      <Text style={styles.ingredientsTitle}>{title}</Text>
      {ingredients.length > 0 ? (
        ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.ingredientItem}>
            • {ingredient}
          </Text>
        ))
      ) : (
        <Text style={styles.noIngredients}>No ingredients detected.</Text>
      )}
    </View>
  );
};

export default IngredientsDisplay;