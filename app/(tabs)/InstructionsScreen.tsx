import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Recipe {
  id: string;
  recipe_name: string;
  image_url: string;
  meal_image_url?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
  ingredients?: string[]; // This should come from your Supabase database
  availableIngredients?: number;
  totalIngredients?: number;
  instructions?: string;
}

export default function InstructionsScreen() {
  const params = useLocalSearchParams();
  const recipe: Recipe = JSON.parse(params.recipe as string);

  // Parse the instructions to extract different sections
  const parseInstructions = (instructionsText: string) => {
    if (!instructionsText) return { ingredients: [], tools: [], steps: [] };

    const lines = instructionsText.split('\n').filter(line => line.trim().length > 0);
    
    let ingredients: string[] = [];
    let tools: string[] = [];
    let steps: string[] = [];
    
    let currentSection = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check for section headers
      if (trimmedLine.includes('**Ingredients:**') || trimmedLine.toLowerCase().includes('ingredients:')) {
        currentSection = 'ingredients';
        return;
      }
      if (trimmedLine.includes('**Tools Needed:**') || trimmedLine.toLowerCase().includes('tools needed:')) {
        currentSection = 'tools';
        return;
      }
      if (trimmedLine.includes('**Instructions:**') || trimmedLine.toLowerCase().includes('instructions:')) {
        currentSection = 'instructions';
        return;
      }
      
      // Add content to appropriate section
      if (currentSection === 'ingredients' && trimmedLine.startsWith('-')) {
        ingredients.push(trimmedLine.substring(1).trim());
      } else if (currentSection === 'tools' && trimmedLine.startsWith('-')) {
        tools.push(trimmedLine.substring(1).trim());
      } else if (currentSection === 'instructions' && (trimmedLine.match(/^\d+\./) || trimmedLine.startsWith('-'))) {
        steps.push(trimmedLine);
      } else if (!currentSection && trimmedLine) {
        // If no sections found, treat as steps
        steps.push(trimmedLine);
      }
    });
    
    return { ingredients, tools, steps };
  };

  const { ingredients: aiIngredients, tools, steps } = parseInstructions(recipe.instructions || '');

  // Use the ingredients from the recipe object or AI-generated ones
  const displayIngredients = recipe.ingredients || aiIngredients;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{
            uri:
              recipe.meal_image_url?.trim() ||
              recipe.image_url?.trim() ||
              'https://via.placeholder.com/400x300.png?text=No+Image',
          }}
          style={styles.recipeImage}
        />

        <Text style={styles.title}>{recipe.recipe_name}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaItem}>⏱ {recipe.cookTime || 'N/A'}</Text>
          <Text style={styles.metaItem}>👥 {recipe.servings ?? 1} servings</Text>
          <Text style={styles.metaItem}>🔥 {recipe.difficulty || 'Easy'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsContainer}>
            {displayIngredients && displayIngredients.length > 0 ? (
              displayIngredients.map((item, index) => (
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

        {tools.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tools Needed</Text>
            <View style={styles.toolsContainer}>
              {tools.map((tool, index) => (
                <View key={index} style={styles.toolItem}>
                  <Text style={styles.toolEmoji}>🔧</Text>
                  <Text style={styles.toolText}>{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>

          {steps.length > 0 ? (
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepCard}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepText}>
                      {step.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.placeholder}>No instructions found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  backContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  scrollContent: { padding: 20 },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    fontSize: 14,
    color: '#6B7280',
  },
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
  toolsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  toolText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontWeight: '400',
  },
  placeholder: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});