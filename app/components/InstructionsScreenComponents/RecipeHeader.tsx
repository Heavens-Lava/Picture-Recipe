import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface RecipeHeaderProps {
  title: string;
  imageUrl?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export default function RecipeHeader({
  title,
  imageUrl,
  cookTime,
  servings,
  difficulty,
}: RecipeHeaderProps) {
  return (
    <View>
      <Image
        source={{
          uri: imageUrl?.trim() || 'https://via.placeholder.com/400x300.png?text=No+Image',
        }}
        style={styles.recipeImage}
      />

      <Text style={styles.title}>{title}</Text>

      <View style={styles.meta}>
        <Text style={styles.metaItem}>⏱ {cookTime || 'N/A'}</Text>
        <Text style={styles.metaItem}>👥 {servings ?? 1} servings</Text>
        <Text style={styles.metaItem}>🔥 {difficulty || 'Easy'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});