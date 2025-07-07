import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';

export default function AccountCreatedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <LottieView
          source={require('../../assets/animations/success.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
      </View>

      <Text style={styles.title}>Account Created Successfully!</Text>
      <Text style={styles.message}>
        Congratulations! Your account has been created successfully.
        {'\n'}Your recipes and grocery lists are now saved to your account and will be synced across all your devices.
      </Text>

      <TouchableOpacity onPress={() => router.replace('/')} style={styles.button}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});