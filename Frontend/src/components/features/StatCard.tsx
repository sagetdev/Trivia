import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import { Card, IconName, IconTile, Text } from '../ui';

interface Props {
  icon: IconName;
  bg: string;
  color: string;
  value: string;
  label: string;
}

export function StatCard({ icon, bg, color, value, label }: Props) {
  return (
    <Card style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
      <IconTile icon={icon} bg={bg} color={color} size={40} iconSize={20} radius={12} />
      <View style={{ gap: 1, flexShrink: 1 }}>
        <Text size={17} weight="semibold" numberOfLines={1}>
          {value}
        </Text>
        <Text size={12} color={colors.textMuted} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Card>
  );
}
