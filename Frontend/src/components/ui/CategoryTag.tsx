import React from 'react';
import { View } from 'react-native';
import { colors, CategoryColor, radii } from '../../theme';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

interface Props {
  icon: IconName;
  label: string;
  color: CategoryColor;
}

export function CategoryTag({ icon, label, color }: Props) {
  const c = colors.category[color];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radii.pill,
        backgroundColor: c.bg,
      }}
    >
      <Icon name={icon} size={14} color={c.fg} />
      <Text size={13} weight="medium" color={c.fg}>
        {label}
      </Text>
    </View>
  );
}
