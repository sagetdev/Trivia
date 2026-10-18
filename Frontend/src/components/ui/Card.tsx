import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface Props {
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function Card({ radius = 18, style, children }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
