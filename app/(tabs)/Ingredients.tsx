import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Minus, ShoppingCart, CheckSquare, Square } from 'lucide-react-native';

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

// Sparkle animation component
const SparkleEffect: React.FC<{ visible: boolean }> = ({ visible }) => {
  const sparkles = Array.from({ length: 3 }, (_, i) => useRef(new Animated.Value(0)).current);
  
  useEffect(() => {
    if (visible) {
      const animations = sparkles.map((sparkle, index) => 
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(sparkle, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      
      Animated.parallel(animations).start();
    } else {
      sparkles.forEach(sparkle => sparkle.setValue(0));
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={sparkleStyles.container}>
      {sparkles.map((sparkle, index) => (
        <Animated.View
          key={index}
          style={[
            sparkleStyles.sparkle,
            sparkleStyles[`sparkle${index + 1}`],
            {
              opacity: sparkle,
              transform: [{
                scale: sparkle.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                })
              }]
            }
          ]}
        >
          <Text style={sparkleStyles.sparkleText}>✨</Text>
        </Animated.View>
      ))}
    </View>
  );
};

// Enhanced IngredientsDisplay component with selection functionality
const IngredientsDisplayWithSelection: React.FC<{
  ingredients: string[];
  selectedIngredients: Set<string>;
  onToggleIngredient: (ingredient: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
}> = ({ ingredients, selectedIngredients, onToggleIngredient, onSelectAll, allSelected }) => {
  const [sparklingIngredients, setSparklingIngredients] = useState<Set<string>>(new Set());
  
  const handleIngredientPress = (ingredient: string) => {
    onToggleIngredient(ingredient);
    
    // Add sparkle effect
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
    
    // Add sparkle effect to all ingredients when select all is pressed
    const allIngredients = new Set(ingredients);
    setSparklingIngredients(allIngredients);
    
    // Remove sparkle effect after animation completes
    setTimeout(() => {
      setSparklingIngredients(new Set());
    }, 800);
  };

  return (
    <View style={ingredientStyles.container}>
      <View style={ingredientStyles.header}>
        <Text style={ingredientStyles.title}>
          Detected Ingredients
        </Text>
        <Text style={ingredientStyles.subtitle}>
          Tap + to add to grocery list
        </Text>
      </View>
      
      <TouchableOpacity
        style={ingredientStyles.selectAllButton}
        onPress={handleSelectAllPress}
      >
        {allSelected ? (
          <CheckSquare size={14} color="#059669" />
        ) : (
          <Square size={14} color="#6B7280" />
        )}
        <Text style={[
          ingredientStyles.selectAllText,
          allSelected && ingredientStyles.selectAllTextSelected
        ]}>
          {allSelected ? 'Unselect All' : 'Select All'}
        </Text>
      </TouchableOpacity>
      
      <View style={ingredientStyles.ingredientGrid}>
        {ingredients.map((ingredient, index) => {
          const isSelected = selectedIngredients.has(ingredient);
          const isSparklings = sparklingIngredients.has(ingredient);
          
          return (
            <View key={index} style={ingredientStyles.ingredientWrapper}>
              <TouchableOpacity
                style={[
                  ingredientStyles.ingredientChip,
                  isSelected && ingredientStyles.ingredientChipSelected
                ]}
                onPress={() => handleIngredientPress(ingredient)}
              >
                <Text style={[
                  ingredientStyles.ingredientText,
                  isSelected && ingredientStyles.ingredientTextSelected
                ]}>
                  {ingredient}
                </Text>
                <View style={[
                  ingredientStyles.toggleIcon,
                  isSelected && ingredientStyles.toggleIconSelected
                ]}>
                  {isSelected ? (
                    <Minus size={12} color="#FFFFFF" />
                  ) : (
                    <Plus size={12} color="#059669" />
                  )}
                </View>
              </TouchableOpacity>
              <SparkleEffect visible={isSparklings} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function IngredientsScreen() {
  const router = useRouter();
  const {
    ingredients,
    recipes,
    detailedRecipes,
  } = useLocalSearchParams<IngredientsScreenParams>();

  // 🔄 Local state
  const [ingredientList, setIngredientList] = useState<string[]>([]);
  const [recipeList, setRecipeList] = useState<string[]>([]);
  const [parsedDetailedRecipes, setParsedDetailedRecipes] = useState<ParsedRecipe[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());

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

  // Handle ingredient selection toggle
  const handleToggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredient)) {
        newSet.delete(ingredient);
      } else {
        newSet.add(ingredient);
      }
      return newSet;
    });
  };

  // Handle select all/unselect all
  const handleSelectAll = () => {
    const allSelected = selectedIngredients.size === ingredientList.length;
    if (allSelected) {
      setSelectedIngredients(new Set());
    } else {
      setSelectedIngredients(new Set(ingredientList));
    }
  };

  // Navigate to grocery screen with selected ingredients
  const handleNavigateToGrocery = () => {
    const selectedItems = Array.from(selectedIngredients);
    if (selectedItems.length === 0) {
      // Could show an alert here if no items selected
      return;
    }

    // Navigate to grocery screen with selected ingredients
    // You might need to adjust the route name based on your navigation setup
    router.push({
      pathname: '/grocery',
      params: {
        newIngredients: JSON.stringify(selectedItems)
      }
    });
  };

  if (!ingredientList || ingredientList.length === 0) {
    return <EmptyState />;
  }

  const visibleRecipes = recipeList.filter(recipe => !removedRecipes.has(recipe));
  const selectedCount = selectedIngredients.size;
  const allSelected = selectedCount === ingredientList.length && ingredientList.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <IngredientsDisplayWithSelection
          ingredients={ingredientList}
          selectedIngredients={selectedIngredients}
          onToggleIngredient={handleToggleIngredient}
          onSelectAll={handleSelectAll}
          allSelected={allSelected}
        />

        {selectedCount > 0 && (
          <View style={groceryButtonStyles.container}>
            <TouchableOpacity
              style={groceryButtonStyles.button}
              onPress={handleNavigateToGrocery}
            >
              <ShoppingCart size={20} color="#FFFFFF" />
              <Text style={groceryButtonStyles.buttonText}>
                Add {selectedCount} to Grocery ({selectedCount})
              </Text>
            </TouchableOpacity>
          </View>
        )}

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

// Sparkle effect styles
const sparkleStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -8,
    right: -5,
  },
  sparkle2: {
    top: 5,
    left: -8,
  },
  sparkle3: {
    bottom: -5,
    right: 10,
  },
  sparkleText: {
    fontSize: 12,
  },
});

// Enhanced styles for the ingredients display
const ingredientStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
  },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleIconSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
});

// Enhanced styles for the grocery button
const groceryButtonStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});