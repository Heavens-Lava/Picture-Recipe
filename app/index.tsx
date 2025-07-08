import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import SoundButton from './components/SoundButton';

export default function WelcomeScreen() {
  const router = useRouter();

  const goToCamera = () => {
    router.replace('/(tabs)/CameraScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <LottieView
            source={require('../assets/animations/camera.json')}
            autoPlay
            loop
            style={styles.lottieIcon}
          />
          <Text style={styles.logo}>Picture Recipes</Text>
          <LottieView
            source={require('../assets/animations/recipe.json')}
            autoPlay
            loop
            style={styles.lottieIcon}
          />
        </View>

        <Text style={styles.subtitle}>
          Welcome to Picture Recipes — your smart kitchen assistant!
          {'\n\n'}Snap a photo of your fridge or pantry and get instant recipes
          based on what you have.
        </Text>

        <SoundButton style={styles.button} onPress={goToCamera}>
          <Text style={styles.buttonText}>📸 Start Scanning</Text>
        </SoundButton>

        <Text style={styles.extraInfo}>
          📝 With this app, you can automatically create grocery lists by just taking a picture!
          {'\n\n'}✅ Once you're at the store, you can even check off items from your grocery list
          by snapping another photo.
          {'\n\n'}Say goodbye to forgotten ingredients and hello to effortless meal planning!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: { fontSize: 32, fontWeight: '700', color: '#059669' },
  lottieIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  extraInfo: {
    marginTop: 30,
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
  },
});
