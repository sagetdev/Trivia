import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { Icon, IconName } from './Icon';

interface Props {
  icon: IconName;
  onPress?: () => void;
  label?: string;
}

export function IconButton({ icon, onPress, label }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? icon}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && { opacity: 0.7 }]}
    >
      <Icon name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
