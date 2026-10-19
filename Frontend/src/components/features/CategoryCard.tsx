import React from 'react';
import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import type { Category } from '../../hooks/useCategories';
import { Card, IconTile, Text } from '../ui';

interface Props {
  category: Category;
  variant?: 'compact' | 'large';
  onPress?: () => void;
}

export function CategoryCard({ category, variant = 'compact', onPress }: Props) {
  const c = colors.category[category.color];
  const large = variant === 'large';

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}>
      {large ? (
        <Card radius={20} style={{ padding: 16, gap: 12 }}>
          <IconTile icon={category.icon} bg={c.bg} color={c.fg} size={48} iconSize={26} radius={15} />
          <Text size={16} weight="semibold" numberOfLines={1}>
            {category.name}
          </Text>
        </Card>
      ) : (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <IconTile icon={category.icon} bg={c.bg} color={c.fg} size={44} iconSize={24} radius={13} />
          <Text size={15} weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {category.name}
          </Text>
        </Card>
      )}
    </Pressable>
  );
}
