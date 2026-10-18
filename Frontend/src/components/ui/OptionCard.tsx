import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type OptionState = 'default' | 'selected' | 'correct' | 'wrong';

interface Props {
  letter: string;
  label: string;
  state?: OptionState;
  disabled?: boolean;
  dimmed?: boolean;
  onPress?: () => void;
}

const tones = {
  default: { bg: colors.surface, border: colors.border, width: 1, badgeBg: colors.surfaceAlt, badgeFg: colors.textMuted },
  selected: { bg: colors.primarySoft, border: colors.primary, width: 2, badgeBg: colors.primary, badgeFg: colors.onPrimary },
  correct: { bg: colors.successSoft, border: colors.success, width: 2, badgeBg: colors.success, badgeFg: colors.onPrimary },
  wrong: { bg: colors.errorSoft, border: colors.error, width: 2, badgeBg: colors.error, badgeFg: colors.onPrimary },
} as const;

export function OptionCard({ letter, label, state = 'default', disabled, dimmed, onPress }: Props) {
  const t = tones[state];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: t.bg,
          borderColor: t.border,
          borderWidth: t.width,
          opacity: dimmed ? 0.4 : pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: t.badgeBg }]}>
        <Text size={14} weight="semibold" color={t.badgeFg}>
          {letter}
        </Text>
      </View>
      <Text size={16} weight="medium" style={styles.label}>
        {label}
      </Text>
      {state === 'correct' && <Icon name="check" size={22} color={colors.success} />}
      {state === 'wrong' && <Icon name="x" size={22} color={colors.error} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
});
