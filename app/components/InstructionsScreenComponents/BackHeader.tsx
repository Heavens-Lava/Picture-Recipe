import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface BackHeaderProps {
  onPress?: () => void;
  title?: string;
}

export default function BackHeader({ onPress, title = 'Back' }: BackHeaderProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.backContainer}>
      <TouchableOpacity onPress={handlePress} style={styles.backButton}>
        <ArrowLeft size={24} color="#111827" />
        <Text style={styles.backText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});