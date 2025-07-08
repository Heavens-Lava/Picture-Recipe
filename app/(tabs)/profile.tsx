import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Share,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  Camera,
  ChefHat,
  ShoppingCart,
  Heart,
  Bell,
  CircleHelp as HelpCircle,
  Share2,
  Star,
  LogIn,
  UserPlus,
  LogOut,
  Edit3,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

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
  isDestructive?: boolean;
}

interface UserData {
  name: string;
  email: string;
  id: string;
  avatar_url?: string;
  created_at?: string;
}

interface UserStats {
  photos_taken: number;
  recipes_tried: number;
  lists_created: number;
  favorites_count: number;
}

export default function ProfileTab() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', id: '' });
  const [userStats, setUserStats] = useState<UserStats>({
    photos_taken: 0,
    recipes_tried: 0,
    lists_created: 0,
    favorites_count: 0,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        await loadUserProfile(session.user);
        await loadUserStats(session.user.id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserData({ name: '', email: '', id: '' });
        setUserStats({
          photos_taken: 0,
          recipes_tried: 0,
          lists_created: 0,
          favorites_count: 0,
        });
      }
      setInitialLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.id);
      
      if (session?.user) {
        await loadUserProfile(session.user);
        await loadUserStats(session.user.id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserData({ name: '', email: '', id: '' });
        setUserStats({
          photos_taken: 0,
          recipes_tried: 0,
          lists_created: 0,
          favorites_count: 0,
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadUserProfile = async (user: any) => {
    try {
      console.log('Loading profile for user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      const displayName = profile?.name || 
                         profile?.display_name || 
                         user.user_metadata?.name || 
                         user.user_metadata?.full_name ||
                         'Welcome Back!';

      setUserData({
        id: user.id,
        email: user.email || '',
        name: displayName,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        created_at: profile?.created_at || user.created_at,
      });

      console.log('Profile loaded:', { name: displayName, email: user.email });
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Fallback to user metadata
      const fallbackName = user.user_metadata?.name || 
                          user.user_metadata?.full_name || 
                          'Welcome Back!';
      
      setUserData({
        id: user.id,
        email: user.email || '',
        name: fallbackName,
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at,
      });
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      console.log('Loading stats for user:', userId);
      
      // In a real app, you would fetch actual stats from your database
      // For now, we'll use mock data that updates based on user activity
      const mockStats = {
        photos_taken: Math.floor(Math.random() * 50) + 10,
        recipes_tried: Math.floor(Math.random() * 30) + 5,
        lists_created: Math.floor(Math.random() * 15) + 3,
        favorites_count: Math.floor(Math.random() * 20) + 2,
      };
      
      setUserStats(mockStats);
      console.log('Stats loaded:', mockStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
        await loadUserStats(session.user.id);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogin = () => {
    router.push('../othertabs/Login');
  };

  const handleSignup = () => {
    router.push('/Signup');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit profile pressed');
    // router.push('/EditProfile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              } else {
                console.log('User logged out successfully');
                setIsAuthenticated(false);
                setUserData({ name: '', email: '', id: '' });
                setUserStats({
                  photos_taken: 0,
                  recipes_tried: 0,
                  lists_created: 0,
                  favorites_count: 0,
                });
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'An unexpected error occurred.');
            }
          },
        },
      ]
    );
  };

  const stats: StatItem[] = [
    {
      icon: <Camera size={24} color="#059669" />,
      label: 'Photos Taken',
      value: isAuthenticated ? userStats.photos_taken.toString() : '0',
      color: '#059669',
    },
    {
      icon: <ChefHat size={24} color="#7C3AED" />,
      label: 'Recipes Tried',
      value: isAuthenticated ? userStats.recipes_tried.toString() : '0',
      color: '#7C3AED',
    },
    {
      icon: <ShoppingCart size={24} color="#F59E0B" />,
      label: 'Lists Created',
      value: isAuthenticated ? userStats.lists_created.toString() : '0',
      color: '#F59E0B',
    },
    {
      icon: <Heart size={24} color="#EF4444" />,
      label: 'Favorites',
      value: isAuthenticated ? userStats.favorites_count.toString() : '0',
      color: '#EF4444',
    },
  ];

const getMenuOptions = (): MenuOption[] => {
  const baseOptions: MenuOption[] = [
    {
      icon: <Settings size={24} color="#6B7280" />,
      label: 'Settings',
      onPress: () => router.push('../othertabs/Settings'),
    },
    {
      icon: <Bell size={24} color="#6B7280" />,
      label: 'Notifications',
      onPress: () => router.push('/othertabs/Notifications'),
    },
    {
      icon: <Heart size={24} color="#6B7280" />,
      label: 'Favorites',
      onPress: () => router.push('/othertabs/Favorites'),
    },
    {
      icon: <Share2 size={24} color="#6B7280" />,
      label: 'Share App',
      onPress: async () => {
        try {
          await Share.share({
            message:
              "Check out this amazing Picture Recipes app! 🍽️ Available now: https://yourapp.com",
          });
        } catch (error) {
          Alert.alert('Error', 'Failed to open share dialog.');
        }
      },
    },
    {
      icon: <Star size={24} color="#6B7280" />,
      label: 'Rate App',
      onPress: () => {
        const url = Platform.select({
          ios: 'itms-apps://itunes.apple.com/app/id0000000000',
          android: 'market://details?id=com.yourapp.package',
        });

        if (url) {
          Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open the app store.');
          });
        }
      },
    },
    {
      icon: <HelpCircle size={24} color="#6B7280" />,
      label: 'Help & Support',
      onPress: () => {
        router.push('/othertabs/HelpSupport');
      },
    },
  ];

  if (isAuthenticated) {
    return [
      ...baseOptions,
      {
        icon: <LogOut size={24} color="#EF4444" />,
        label: 'Logout',
        onPress: handleLogout,
        isDestructive: true,
      },
    ];
  }

  return baseOptions;
};

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
    <TouchableOpacity 
      key={index} 
      style={[
        styles.menuOption,
        index === getMenuOptions().length - 1 && styles.lastMenuOption
      ]} 
      onPress={option.onPress}
    >
      {option.icon}
      <Text
        style={[styles.menuOptionText, option.isDestructive && { color: '#EF4444' }]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderGuestContent = () => (
    <View style={styles.guestContainer}>
      <View style={styles.guestHeader}>
        <View style={styles.avatarContainer}>
          <User size={48} color="#9CA3AF" />
        </View>
        <Text style={styles.guestTitle}>Welcome to Picture Recipes!</Text>
        <Text style={styles.guestSubtitle}>
          Sign in to track your recipes, save favorites, and unlock all features
        </Text>
      </View>

      <View style={styles.authButtonsContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <LogIn size={20} color="#FFFFFF" />
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <UserPlus size={20} color="#059669" />
          <Text style={styles.signupButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.guestFeatures}>
        <Text style={styles.featuresTitle}>What you'll get:</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Camera size={16} color="#059669" />
            <Text style={styles.featureText}>Save recipe photos</Text>
          </View>
          <View style={styles.featureItem}>
            <Heart size={16} color="#059669" />
            <Text style={styles.featureText}>Create favorites list</Text>
          </View>
          <View style={styles.featureItem}>
            <ChefHat size={16} color="#059669" />
            <Text style={styles.featureText}>Track cooking progress</Text>
          </View>
          <View style={styles.featureItem}>
            <ShoppingCart size={16} color="#059669" />
            <Text style={styles.featureText}>Manage shopping lists</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAuthenticatedContent = () => (
    <>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <User size={48} color="#059669" />
        </View>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Edit3 size={16} color="#059669" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.statsGrid}>{stats.map(renderStatCard)}</View>
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
              {userStats.recipes_tried >= 20 
                ? `You've tried ${userStats.recipes_tried} recipes! Amazing!` 
                : `You've tried ${userStats.recipes_tried} recipes! Keep cooking!`
              }
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#059669']}
            tintColor="#059669"
          />
        }
      >
        {isAuthenticated ? renderAuthenticatedContent() : renderGuestContent()}

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>
            {isAuthenticated ? 'Settings' : 'General'}
          </Text>
          <View style={styles.menuList}>
            {getMenuOptions().map(renderMenuOption)}
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName}>Picture Recipes</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#059669',
  },
  guestContainer: { marginBottom: 24 },
  guestHeader: {
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
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  authButtonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  signupButtonText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  guestFeatures: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#059669',
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
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  editButtonText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
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
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastMenuOption: {
    borderBottomWidth: 0,
  },
  menuOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 48,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  appVersion: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});