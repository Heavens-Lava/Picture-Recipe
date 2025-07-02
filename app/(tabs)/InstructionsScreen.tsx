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
import { PanGestureHandler } from 'react-native-gesture-handler';

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

  const steps =
    recipe.instructions
      ?.split('\n')
      .filter((line) => line.trim().length > 0) || [];

  const [stepIndex, setStepIndex] = useState(0);

  const handleSwipe = (event: any) => {
    const { translationX } = event.nativeEvent;
    if (translationX < -50 && stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else if (translationX > 50 && stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  // Use the ingredients directly from the recipe object (from Supabase)
  const ingredients = recipe.ingredients || [];

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
          {ingredients && ingredients.length > 0 ? (
            ingredients.map((item, index) => (
              <Text key={index} style={styles.listItem}>• {item}</Text>
            ))
          ) : (
            <Text style={styles.placeholder}>No ingredients found.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>

          <PanGestureHandler onGestureEvent={handleSwipe}>
            <View style={styles.stepContainer}>
              <Text style={styles.stepText}>
                {steps.length > 0 ? steps[stepIndex] : 'No instructions found.'}
              </Text>
              {steps.length > 1 && (
                <Text style={styles.stepIndex}>
                  Step {stepIndex + 1} of {steps.length}
                </Text>
              )}
            </View>
          </PanGestureHandler>
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
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  stepContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
  },
  stepText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  stepIndex: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  placeholder: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});