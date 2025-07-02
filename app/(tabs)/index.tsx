import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  const goToCamera = () => {
    router.replace('/(tabs)/CameraScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🥬 Picture Recipes</Text>

        <Text style={styles.subtitle}>
          Welcome to Picture Recipes — the smart kitchen companion.
          Snap a photo of your fridge or pantry to get instant recipe ideas.
        </Text>

        <TouchableOpacity style={styles.button} onPress={goToCamera}>
          <Text style={styles.buttonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: '700', color: '#059669', marginBottom: 20 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  button: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
