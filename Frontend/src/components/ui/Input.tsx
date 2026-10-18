import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts } from '../../theme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label: string;
}

export function Input({ label, onFocus, onBlur, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text size={13} weight="medium" color={colors.textMuted}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.field, { borderColor: focused ? colors.primary : colors.border }, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, width: '100%' },
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
});
