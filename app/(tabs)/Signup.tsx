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

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => router.back();

  const handleSignup = async () => {
    console.log('🔧 Inputs:', { name, email, password, confirmPassword });

    if (!name || !email || !password || !confirmPassword) {
      console.warn('⚠️ Missing input fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      console.warn('⚠️ Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    console.log('🔄 Starting signup process...');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          }
        }
      });

      console.log('📥 Signup response:', JSON.stringify(data, null, 2));

      if (signUpError) {
        console.error('❌ Signup error:', signUpError.message);
        Alert.alert('Signup Error', signUpError.message);
        return;
      }

      if (!data.user) {
        console.error('❌ No user returned after signup');
        return;
      }

      console.log('🧠 User ID returned:', data.user.id);

      // Since email confirmation is disabled, user should be automatically signed in
      if (data.session) {
        console.log('✅ User signed in immediately with session:', data.session);
        
        // Try to create profile with retry logic
        const insertProfile = async (retries = 3) => {
          for (let i = 0; i < retries; i++) {
            try {
              console.log(`🔄 Profile insert attempt ${i + 1}/${retries}`);
              
              // Add a small delay before each attempt
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }

              const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: data.user.id,
                    email: email.trim(),
                    name: name.trim(),
                  },
                ]);

              if (profileError) {
                console.error(`❌ Profile insert error (attempt ${i + 1}):`, profileError.message);
                if (i === retries - 1) {
                  throw profileError;
                }
                continue;
              }

              console.log('✅ Profile inserted successfully');
              return true;
            } catch (error) {
              console.error(`❌ Profile insert attempt ${i + 1} failed:`, error);
              if (i === retries - 1) {
                throw error;
              }
            }
          }
          return false;
        };

        try {
          await insertProfile();
          // Redirect to the account created success page
          router.replace('/AccountCreatedSuccessfully');
        } catch (profileError) {
          console.error('❌ All profile insert attempts failed:', profileError);
          
          // Don't block the user flow - they can complete profile later
          Alert.alert(
            'Account Created',
            'Your account was created successfully, but we couldn\'t complete your profile setup. You can update your profile information later.',
            [
              { 
                text: 'OK', 
                onPress: () => router.replace('/AccountCreatedSuccessfully')
              }
            ]
          );
        }
      } else {
        console.log('❌ No session returned - this should not happen with email confirmation disabled');
        Alert.alert(
          'Account Created',
          'Your account was created but there was an issue signing you in. Please try logging in.',
          [
            { text: 'OK', onPress: () => router.replace('/login') },
          ]
        );
      }
    } catch (error) {
      console.error('🔥 Unexpected error during signup:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      console.log('✅ Signup process complete');
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

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Picture Recipes</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              placeholderTextColor="#9CA3AF"
            />
          </View>

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
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9CA3AF"
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                {showConfirmPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/Login')} style={styles.switchLink}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchTextHighlight}>Sign in</Text>
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