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
import { Clock, Users, Flame, Star, RefreshCw, Heart } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { styles } from '../styles/Recipes.styles';
import LottieView from 'lottie-react-native';
import FastImage from 'expo-fast-image';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface Recipe {
  id: string;
  recipe_name: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
  availableIngredients?: number;
  totalIngredients?: number;
  image_url?: string | null;
  instructions?: string;
  instruction_ingredients?: string[];
}

export default function RecipesTab() {
  useRequireAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available'>('available');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      console.log("Message: ", message);
    }
  };

  const fetchFavorites = async (userId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId);
    if (error) {
      console.error('❌ Error fetching favorites:', error);
    } else {
      setFavoriteIds(data?.map(fav => fav.recipe_id) ?? []);
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      console.error('❌ No user ID found. Cannot fetch user recipes.');
      setRecipes([]);
      setLoading(false);
      return;
    }

    await fetchFavorites(userId);

    const { data, error } = await supabase
      .from('recipes')
      .select(
        'id, recipe_name, cookTime, servings, difficulty, rating, availableIngredients, totalIngredients, instructions, instruction_ingredients, image_url'
      )
      .eq('user_id', userId)
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error fetching recipes:', error);
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

  const handleFavorite = async (recipeId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    if (favoriteIds.includes(recipeId)) {
      showToast('Already in favorites');
      return;
    }

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, recipe_id: recipeId });

    if (error) {
      showToast('Error adding to favorites');
    } else {
      setFavoriteIds([...favoriteIds, recipeId]);
      showToast('Added to favorites');
    }
  };

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
    const isFavorited = favoriteIds.includes(recipe.id);

    return (
      <TouchableOpacity
        key={recipe.id}
        style={styles.recipeCard}
        onPress={() =>
          router.push({
            pathname: '../othertabs/InstructionsScreen',
            params: { recipe: JSON.stringify(recipe) },
          })
        }
      >
        {recipe.image_url && (
          <FastImage
            source={{ uri: recipe.image_url }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
        )}

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
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        (recipe.availableIngredients / recipe.totalIngredients) * 100 || 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={{ marginTop: 10 }}
            onPress={() => handleFavorite(recipe.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Heart size={16} color="#EF4444" />
              <Text style={{ marginLeft: 6, color: '#EF4444' }}>
                {isFavorited ? 'Favorited' : 'Add to Favorites'}
              </Text>
            </View>
          </TouchableOpacity>
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
          style={[
            styles.filterButton,
            selectedFilter === 'available' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('available')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'available' && styles.filterButtonTextActive,
            ]}
          >
            Ready to Cook
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive,
            ]}
          >
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
