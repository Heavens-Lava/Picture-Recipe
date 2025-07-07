// app/(tabs)/CreateAccount.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function CreateAccount() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('../(tabs)/index'); // Redirect to main tab if logged in
      }
    };

    checkAuth();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome to Picture Recipes</Text>
      <Text style={styles.subtext}>
        To save your recipes and grocery lists, please create an account or log in.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('./Login')}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => router.push('./Signup')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 36,
  },
  button: {
    backgroundColor: '#00b894',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#0984e3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
