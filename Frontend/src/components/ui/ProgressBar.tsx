import React from 'react';
import { View } from 'react-native';
import { colors, radii } from '../../theme';

export function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View
      style={{
        height: 8,
        width: '100%',
        borderRadius: radii.pill,
        backgroundColor: colors.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: 8,
          borderRadius: radii.pill,
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
}
