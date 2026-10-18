import React from 'react';
import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Text } from './Text';

interface Props<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        padding: 4,
        borderRadius: 14,
        backgroundColor: colors.surfaceAlt,
      }}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.id)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: active ? colors.surface : 'transparent',
            }}
          >
            <Text size={14} weight={active ? 'semibold' : 'medium'} color={active ? colors.text : colors.textMuted}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
