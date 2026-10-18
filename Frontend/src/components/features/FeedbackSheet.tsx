import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { Button, Icon, Text } from '../ui';

export type Verdict = 'correct' | 'wrong' | 'timeout';

interface Props {
  verdict: Verdict;
  answer: string;
  explanation: string;
  isLast: boolean;
  onNext: () => void;
}

export function FeedbackSheet({ verdict, answer, explanation, isLast, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const ok = verdict === 'correct';
  const tone = ok ? colors.success : colors.error;
  const title = ok ? 'Correct! Nice work' : verdict === 'timeout' ? `Time’s up — the answer is ${answer}` : `Not quite — the answer is ${answer}`;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: Math.max(insets.bottom, 20) + 14,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ok ? colors.successSoft : colors.errorSoft,
          }}
        >
          <Icon name={ok ? 'check' : 'x'} size={18} color={tone} />
        </View>
        <Text size={18} weight="bold" color={tone} style={{ flex: 1 }}>
          {title}
        </Text>
      </View>
      <Text size={15} lineHeight={22} color={colors.textMuted}>
        {explanation}
      </Text>
      <Button label={isLast ? 'See results' : 'Next question'} onPress={onNext} />
    </View>
  );
}
