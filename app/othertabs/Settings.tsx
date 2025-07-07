// app/othertabs/Settings.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>

        {/* You can add actual toggles or settings items below */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.item}>🔔 Notifications</Text>
          <Text style={styles.item}>🎨 Theme</Text>
          <Text style={styles.item}>🛠️ Language</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.item}>📧 Change Email</Text>
          <Text style={styles.item}>🔐 Reset Password</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 24 },
  backButton: { marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  item: {
    fontSize: 16,
    color: '#6B7280',
    paddingVertical: 8,
  },
});
