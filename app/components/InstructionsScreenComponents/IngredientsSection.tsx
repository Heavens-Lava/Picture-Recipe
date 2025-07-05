import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IngredientsSectionProps {
  ingredients: string[];
}

export default function IngredientsSection({ ingredients }: IngredientsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      <View style={styles.ingredientsContainer}>
        {ingredients && ingredients.length > 0 ? (
          ingredients.map((item, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientBullet} />
              <Text style={styles.ingredientText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.placeholder}>No ingredients found.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  ingredientsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  placeholder: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});