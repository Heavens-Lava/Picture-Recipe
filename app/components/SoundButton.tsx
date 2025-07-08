// components/SoundButton.tsx
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Audio } from 'expo-av';
import bubblePopSound from '../../assets/sounds/bubble-pop.mp3'; // adjust if path is different

export default function SoundButton(props: TouchableOpacityProps) {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(bubblePopSound);
      soundRef.current = sound;
    };

    loadSound();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const handlePress = async (e: any) => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (err) {
      console.warn('Sound playback failed:', err);
    }

    // Call original onPress
    props.onPress?.(e);
  };

  return <TouchableOpacity {...props} onPress={handlePress} />;
}
