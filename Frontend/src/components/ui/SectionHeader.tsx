import React from 'react';
import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Text } from './Text';

interface Props {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionLabel, onActionPress }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text size={18} weight="semibold">
        {title}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text size={14} weight="medium" color={colors.primary}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
