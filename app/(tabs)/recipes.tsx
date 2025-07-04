import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Users, Flame, Star, RefreshCw } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { styles } from '../styles/Recipes.styles';
import LottieView from 'lottie-react-native';

interface Recipe {
  id: string;
  recipe_name: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
  ingredients?: string[];
  availableIngredients?: number;
  totalIngredients?: number;
}

export default function RecipesTab() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available'>('available');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      console.log(message);
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('recipes').select('*');
    if (error) {
      console.error('Error fetching recipes:', error);
    } else {
      const filtered = (data ?? []).filter(r => r.recipe_name && r.recipe_name.trim().length > 0);
      setRecipes(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecipes().then(() => {
      setRefreshing(false);
      showToast('Recipes refreshed');
    });
  }, []);

  const filteredRecipes =
    selectedFilter === 'available'
      ? recipes.filter(
          r =>
            r.recipe_name?.trim() &&
            r.availableIngredients != null &&
            r.totalIngredients != null &&
            r.availableIngredients === r.totalIngredients
        )
      : recipes.filter(r => r.recipe_name?.trim());

  const renderRecipeCard = (recipe: Recipe) => {
    return (
      <TouchableOpacity
        key={recipe.id}
        style={styles.recipeCard}
        onPress={() =>
          router.push({
            pathname: '/InstructionsScreen',
            params: { recipe: JSON.stringify(recipe) },
          })
        }
      >
        <View style={styles.recipeContent}>
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle}>{recipe.recipe_name || 'Unnamed Recipe'}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.rating}>{recipe.rating ?? 0}</Text>
            </View>
          </View>
          <View style={styles.recipeStats}>
            <View style={styles.statItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.statText}>{recipe.cookTime || 'N/A'}</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={16} color="#6B7280" />
              <Text style={styles.statText}>{recipe.servings ?? 1}</Text>
            </View>
            <View style={styles.statItem}>
              <Flame size={16} color="#6B7280" />
              <Text style={styles.statText}>{recipe.difficulty || 'Easy'}</Text>
            </View>
          </View>
          {recipe.availableIngredients !== undefined && recipe.totalIngredients !== undefined && (
            <View style={styles.ingredientStatus}>
              <Text style={styles.ingredientText}>
                {recipe.availableIngredients}/{recipe.totalIngredients} ingredients available
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${(recipe.availableIngredients / recipe.totalIngredients) * 100 || 0}%` }]}
                />
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
  <View style={styles.headerTitleRow}>
    <Text style={styles.headerTitle}>Recipe Suggestions</Text>
    <LottieView
      source={require('../../assets/animations/pan.json')}
      autoPlay
      loop
      style={styles.lottieIcon}
    />
  </View>
  <Text style={styles.headerSubtitle}>Based on your fridge contents</Text>
</View>


      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'available' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('available')}
        >
          <Text style={[styles.filterButtonText, selectedFilter === 'available' && styles.filterButtonTextActive]}>
            Ready to Cook
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterButtonText, selectedFilter === 'all' && styles.filterButtonTextActive]}>
            All Recipes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            fetchRecipes();
            showToast('Recipes refreshed');
          }}
        >
          <RefreshCw size={20} color="#059669" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.center}>
          <Text>No recipes found. Try scanning your fridge to add some!</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredRecipes.map(renderRecipeCard)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}