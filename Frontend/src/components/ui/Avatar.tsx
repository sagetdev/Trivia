import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

interface Props {
  initials: string;
  size?: number;
  bg: string;
  fg: string;
  fontSize?: number;
}

export function Avatar({ initials, size = 44, bg, fg, fontSize }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text size={fontSize ?? Math.round(size * 0.34)} weight="semibold" color={fg}>
        {initials}
      </Text>
    </View>
  );
}
