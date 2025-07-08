// app/othertabs/Notifications.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CalendarDays, ChefHat, Info, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase'; // Adjust path if needed

type Notification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  // add other fields as needed
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Map titles or categories to icons
  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('recipe')) return <ChefHat size={20} color="#059669" />;
    if (title.toLowerCase().includes('grocery')) return <CalendarDays size={20} color="#F59E0B" />;
    if (title.toLowerCase().includes('update')) return <Info size={20} color="#3B82F6" />;
    return <Bell size={20} color="#6B7280" />;
  };

  // Format time (basic)
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const fetchNotifications = async () => {
    setLoading(true);

    try {
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        console.error('User not authenticated.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else if (data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#059669" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {notifications.length === 0 ? (
            <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 20 }}>
              No notifications yet.
            </Text>
          ) : (
            notifications.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.icon}>{getIcon(item.title)}</View>
                <View style={styles.textContent}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
