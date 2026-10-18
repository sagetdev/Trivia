import React from 'react';
import { View } from 'react-native';
import { Icon, IconName } from './Icon';

interface Props {
  icon: IconName;
  bg: string;
  color: string;
  size?: number;
  iconSize?: number;
  radius?: number;
}

export function IconTile({ icon, bg, color, size = 44, iconSize = 24, radius = 13 }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={iconSize} color={color} />
    </View>
  );
}
