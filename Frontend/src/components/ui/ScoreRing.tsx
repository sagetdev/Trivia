import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme';
import { Text } from './Text';

interface Props {
  score: number;
  total: number;
  size?: number;
  stroke?: number;
}

export function ScoreRing({ score, total, size = 200, stroke = 14 }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = total > 0 ? score / total : 0;
  const cx = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={cx} cy={cx} r={r} stroke={colors.surfaceAlt} strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - progress)}
          rotation={-90}
          origin={`${cx}, ${cx}`}
        />
      </Svg>
      <Text size={48} weight="bold">
        {score}/{total}
      </Text>
      <Text size={13} weight="medium" color={colors.textMuted}>
        Correct answers
      </Text>
    </View>
  );
}
