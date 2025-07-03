import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';

export default function ConfirmEmailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <LottieView
          source={require('../../assets/animations/email.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
      </View>

      <Text style={styles.title}>Check Your Inbox</Text>
      <Text style={styles.message}>
        We've sent a confirmation link to your email address.
        {'\n'}Please click the link to complete your signup.
      </Text>

      <TouchableOpacity onPress={() => router.replace('/Login')} style={styles.button}>
        <Text style={styles.buttonText}>Back to Login</Text>
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
