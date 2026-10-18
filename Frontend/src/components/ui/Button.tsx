import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii } from '../../theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

const variants = {
  primary: { bg: colors.primary, fg: colors.onPrimary, border: false },
  secondary: { bg: colors.surface, fg: colors.text, border: true },
  soft: { bg: colors.primarySoft, fg: colors.primary, border: false },
  ghost: { bg: 'transparent', fg: colors.primary, border: false },
} as const;

export function Button({ label, onPress, variant = 'primary', disabled, textColor, style }: Props) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text size={16} weight="semibold" color={textColor ?? v.fg}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: radii.md,
  },
});
