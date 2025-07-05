// components/IngredientsScreenComponents/IngredientsDisplayWithSelection.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus, CheckSquare, Square } from 'lucide-react-native';
import { SparkleEffect } from './SparkleEffect';

interface Props {
  ingredients: string[];
  selectedIngredients: Set<string>;
  onToggleIngredient: (ingredient: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
}

export const IngredientsDisplayWithSelection: React.FC<Props> = ({
  ingredients,
  selectedIngredients,
  onToggleIngredient,
  onSelectAll,
  allSelected,
}) => {
  const [sparklingIngredients, setSparklingIngredients] = useState<Set<string>>(new Set());

  const handleIngredientPress = (ingredient: string) => {
    onToggleIngredient(ingredient);

    setSparklingIngredients(prev => new Set([...prev, ingredient]));
    setTimeout(() => {
      setSparklingIngredients(prev => {
        const newSet = new Set(prev);
        newSet.delete(ingredient);
        return newSet;
      });
    }, 800);
  };

  const handleSelectAllPress = () => {
    onSelectAll();
    setSparklingIngredients(new Set(ingredients));
    setTimeout(() => setSparklingIngredients(new Set()), 800);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detected Ingredients</Text>
        <Text style={styles.subtitle}>Tap + to add to grocery list</Text>
      </View>

      <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAllPress}>
        {allSelected ? (
          <CheckSquare size={14} color="#059669" />
        ) : (
          <Square size={14} color="#6B7280" />
        )}
        <Text style={[styles.selectAllText, allSelected && styles.selectAllTextSelected]}>
          {allSelected ? 'Unselect All' : 'Select All'}
        </Text>
      </TouchableOpacity>

      <View style={styles.ingredientGrid}>
        {ingredients.map((ingredient, index) => {
          const isSelected = selectedIngredients.has(ingredient);
          const isSparkling = sparklingIngredients.has(ingredient);

          return (
            <View key={index} style={styles.ingredientWrapper}>
              <TouchableOpacity
                style={[styles.ingredientChip, isSelected && styles.ingredientChipSelected]}
                onPress={() => handleIngredientPress(ingredient)}
              >
                <Text style={[styles.ingredientText, isSelected && styles.ingredientTextSelected]}>
                  {ingredient}
                </Text>
                <View style={[styles.toggleIcon, isSelected && styles.toggleIconSelected]}>
                  {isSelected ? (
                    <Minus size={12} color="#FFFFFF" />
                  ) : (
                    <Plus size={12} color="#059669" />
                  )}
                </View>
              </TouchableOpacity>
              <SparkleEffect visible={isSparkling} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  header: { marginBottom: 16 },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    gap: 6,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectAllText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  selectAllTextSelected: {
    color: '#059669',
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ingredientWrapper: {
    position: 'relative',
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientChipSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  ingredientText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  ingredientTextSelected: {
    color: '#059669',
  },
  toggleIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleIconSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
});
