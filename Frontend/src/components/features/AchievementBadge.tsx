import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import type { Achievement } from '../data/mock';
import { IconTile, Text } from '../ui';

export function AchievementBadge({ item }: { item: Achievement }) {
  const bg = item.locked || !item.color ? colors.surfaceAlt : colors.category[item.color].bg;
  const fg = item.locked || !item.color ? colors.textFaint : colors.category[item.color].fg;

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
      <IconTile icon={item.icon} bg={bg} color={fg} size={56} iconSize={26} radius={17} />
      <Text size={12} weight="medium" color={colors.textMuted}>
        {item.label}
      </Text>
    </View>
  );
}
