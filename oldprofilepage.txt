import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Camera, ChefHat, ShoppingCart, Heart, Bell, CircleHelp as HelpCircle, Share, Star } from 'lucide-react-native';

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

interface MenuOption {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

export default function ProfileTab() {
  const stats: StatItem[] = [
    {
      icon: <Camera size={24} color="#059669" />,
      label: 'Photos Taken',
      value: '47',
      color: '#059669',
    },
    {
      icon: <ChefHat size={24} color="#7C3AED" />,
      label: 'Recipes Tried',
      value: '23',
      color: '#7C3AED',
    },
    {
      icon: <ShoppingCart size={24} color="#F59E0B" />,
      label: 'Lists Created',
      value: '12',
      color: '#F59E0B',
    },
    {
      icon: <Heart size={24} color="#EF4444" />,
      label: 'Favorites',
      value: '8',
      color: '#EF4444',
    },
  ];

  const menuOptions: MenuOption[] = [
    {
      icon: <Settings size={24} color="#6B7280" />,
      label: 'Settings',
      onPress: () => {},
    },
    {
      icon: <Bell size={24} color="#6B7280" />,
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: <Heart size={24} color="#6B7280" />,
      label: 'Favorites',
      onPress: () => {},
    },
    {
      icon: <Share size={24} color="#6B7280" />,
      label: 'Share App',
      onPress: () => {},
    },
    {
      icon: <Star size={24} color="#6B7280" />,
      label: 'Rate App',
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={24} color="#6B7280" />,
      label: 'Help & Support',
      onPress: () => {},
    },
  ];

  const renderStatCard = (stat: StatItem, index: number) => (
    <View key={index} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
        {stat.icon}
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  const renderMenuOption = (option: MenuOption, index: number) => (
    <TouchableOpacity key={index} style={styles.menuOption} onPress={option.onPress}>
      {option.icon}
      <Text style={styles.menuOptionText}>{option.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#059669" />
          </View>
          <Text style={styles.userName}>Welcome Back!</Text>
          <Text style={styles.userEmail}>Discover amazing recipes with AI</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            {stats.map(renderStatCard)}
          </View>
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Recent Achievement</Text>
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <ChefHat size={32} color="#F59E0B" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>Recipe Explorer</Text>
              <Text style={styles.achievementDescription}>
                You've tried 20+ recipes! Keep cooking!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuList}>
            {menuOptions.map(renderMenuOption)}
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName}>FridgeWise</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuOptionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginLeft: 16,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});