import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { colors } from '../../theme';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ value, onValueChange }: Props) {
  const x = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(x, { toValue: value ? 1 : 0, duration: 160, useNativeDriver: false }).start();
  }, [value, x]);

  const bg = x.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] });
  const left = x.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      hitSlop={8}
    >
      <Animated.View style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: bg }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 2,
            left,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: colors.onPrimary,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
