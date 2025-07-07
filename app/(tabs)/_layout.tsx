// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Camera, ClipboardList, ChefHat, ShoppingCart, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import React, { useEffect, useRef } from 'react';
import bubblePopSound from '../../assets/sounds/bubble-pop.mp3';
import { Audio } from 'expo-av';

export default function TabLayout() {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Preload the sound once
  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(bubblePopSound);
      soundRef.current = sound;
    };

    loadSound();

    return () => {
      // Cleanup when component unmounts
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Play the sound (reuse the same soundRef)
  const playBubblePop = async () => {
    try {
      const sound = soundRef.current;
      if (sound) {
        await sound.replayAsync(); // replay from beginning
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="CameraScreen"
        options={{
          title: 'Camera',
          tabBarIcon: ({ size, color }) => <Camera size={size} color={color} />,
        }}
        listeners={{ tabPress: playBubblePop }}
      />
      <Tabs.Screen
        name="Ingredients"
        options={{
          title: 'Ingredients',
          tabBarIcon: ({ size, color }) => <ClipboardList size={size} color={color} />,
        }}
        listeners={{ tabPress: playBubblePop }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ size, color }) => <ChefHat size={size} color={color} />,
        }}
        listeners={{ tabPress: playBubblePop }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Grocery',
          tabBarIcon: ({ size, color }) => <ShoppingCart size={size} color={color} />,
        }}
        listeners={{ tabPress: playBubblePop }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
        listeners={{ tabPress: playBubblePop }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  tabBarItem: {
    paddingHorizontal: 0,
  },
});
