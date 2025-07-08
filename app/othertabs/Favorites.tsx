import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { X, Trash2 } from 'lucide-react-native';

interface Recipe {
  id: string;
  recipe_name: string;
  title: string;
  image_url?: string | null;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnimations, setFadeAnimations] = useState<{ [key: string]: Animated.Value }>({});
  const [recentlyRemoved, setRecentlyRemoved] = useState<Recipe | null>(null);
  const undoTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      let { data, error } = await supabase
        .from('favorites')
        .select(`recipe_id, recipes (id, recipe_name, title, image_url)`) 
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
      } else if (data) {
        const favoriteRecipes = data.map((fav) => fav.recipes).filter(Boolean);
        setFavorites(favoriteRecipes);

        const animations: { [key: string]: Animated.Value } = {};
        favoriteRecipes.forEach((recipe) => {
          animations[recipe.id] = new Animated.Value(1);
        });
        setFadeAnimations(animations);
      }
    } catch (err) {
      console.error('Unexpected error fetching favorites:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfavorite = async (recipeId: string) => {
    const recipeToRemove = favorites.find((fav) => fav.id === recipeId);
    if (!recipeToRemove) return;

    Animated.timing(fadeAnimations[recipeId], {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setFavorites((prev) => prev.filter((fav) => fav.id !== recipeId));
      setRecentlyRemoved(recipeToRemove);

      undoTimeout.current = setTimeout(async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session?.user?.id) return;

          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', session.user.id)
            .eq('recipe_id', recipeId);

          if (error) console.error('Error removing favorite:', error);
        } catch (err) {
          console.error('Unexpected error unfavoriting:', err);
        }
        setRecentlyRemoved(null);
      }, 5000);
    });
  };

  const handleUndo = () => {
    if (!recentlyRemoved) return;
    const restored = recentlyRemoved;
    setFavorites((prev) => [restored, ...prev]);
    setRecentlyRemoved(null);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnimations[item.id] || 1 }]}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() =>
          router.push({
            pathname: '../othertabs/InstructionsScreen',
            params: { recipe: JSON.stringify(item) },
          })
        }
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}
        <Text style={styles.title}>{item.title || item.recipe_name}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleUnfavorite(item.id)}>
        <Trash2 size={20} color="#DC2626" />
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorites added yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {recentlyRemoved && (
        <TouchableOpacity style={styles.undoBar} onPress={handleUndo}>
          <Text style={styles.undoText}>Undo remove "{recentlyRemoved.title || recentlyRemoved.recipe_name}"</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6B7280' },
  listContent: { padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#6B7280',
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  undoBar: {
    backgroundColor: '#E0F2FE',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#BFDBFE',
  },
  undoText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
});
