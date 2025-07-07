import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Login Error', error.message);
        return;
      }

      if (!data.session) {
        Alert.alert(
          'Email Not Confirmed',
          'Please confirm your email before logging in.'
        );
        return;
      }

      Alert.alert('Success', 'Logged in successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/'), 
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to Picture Recipes</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('./Signup')} style={styles.switchLink}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchTextHighlight}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24, flexGrow: 1 },
  backButton: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    color: '#111827',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    color: '#111827',
  },
  eyeButton: { paddingHorizontal: 12 },
  button: {
    height: 48,
    backgroundColor: '#059669',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  switchLink: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#374151' },
  switchTextHighlight: { color: '#059669', fontWeight: 'bold' },
});