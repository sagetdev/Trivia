import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import { IconButton, Text, TimerPill } from '../ui';

interface Props {
  title: string;
  onClose: () => void;
  timer?: string | null;
}

export function QuizTopBar({ title, onClose, timer }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <IconButton icon="x" label="Close" onPress={onClose} />
      <Text size={15} weight="semibold" color={colors.textMuted}>
        {title}
      </Text>
      {timer ? <TimerPill label={timer} /> : <View style={{ width: 44 }} />}
    </View>
  );
}
