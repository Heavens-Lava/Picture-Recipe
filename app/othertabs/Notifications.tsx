// app/othertabs/Notifications.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CalendarDays, ChefHat, Info, X } from 'lucide-react-native';
import { router } from 'expo-router';

const mockNotifications = [
  {
    id: 1,
    icon: <ChefHat size={20} color="#059669" />,
    title: 'New Recipe Unlocked!',
    message: 'Try out the new “Spicy Chickpea Bowl” today!',
    time: '2h ago',
  },
  {
    id: 2,
    icon: <CalendarDays size={20} color="#F59E0B" />,
    title: 'Grocery List Reminder',
    message: 'You have 3 items still unchecked on your list.',
    time: '1 day ago',
  },
  {
    id: 3,
    icon: <Info size={20} color="#3B82F6" />,
    title: 'App Update',
    message: 'New AI recipe planner feature now live!',
    time: '3 days ago',
  },
];

export default function Notifications() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mockNotifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.icon}>{item.icon}</View>
            <View style={styles.textContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  icon: {
    marginRight: 12,
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
