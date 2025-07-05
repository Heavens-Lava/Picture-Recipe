// components/IngredientsScreenComponents/SparkleEffect.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface SparkleEffectProps {
  visible: boolean;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({ visible }) => {
  const sparkles = Array.from({ length: 3 }, () => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    if (visible) {
      const animations = sparkles.map((sparkle, index) =>
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(sparkle, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.parallel(animations).start();
    } else {
      sparkles.forEach((sparkle) => sparkle.setValue(0));
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {sparkles.map((sparkle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.sparkle,
            styles[`sparkle${index + 1}` as keyof typeof styles],
            {
              opacity: sparkle,
              transform: [
                {
                  scale: sparkle.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.sparkleText}>✨</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -8,
    right: -5,
  },
  sparkle2: {
    top: 5,
    left: -8,
  },
  sparkle3: {
    bottom: -5,
    right: 10,
  },
  sparkleText: {
    fontSize: 12,
  },
});
