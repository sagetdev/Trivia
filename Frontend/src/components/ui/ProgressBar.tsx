import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radii } from '../../theme';

export function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(pct);

  useEffect(() => {
    width.value = reduceMotion ? pct : withTiming(pct, { duration: 240 });
  }, [pct, reduceMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{
        height: 8,
        width: '100%',
        borderRadius: radii.pill,
        backgroundColor: colors.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: 8,
            borderRadius: radii.pill,
            backgroundColor: colors.primary,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
