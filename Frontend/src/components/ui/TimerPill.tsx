import React from 'react';
import { View } from 'react-native';
import { colors, radii } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export function TimerPill({ label }: { label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radii.pill,
        backgroundColor: colors.warningSoft,
      }}
    >
      <Icon name="clock" size={16} color={colors.warning} />
      <Text size={14} weight="semibold" color={colors.warning}>
        {label}
      </Text>
    </View>
  );
}
