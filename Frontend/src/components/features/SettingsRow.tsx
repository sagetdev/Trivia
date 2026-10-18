import React from 'react';
import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Icon, IconName, IconTile, Text, Toggle } from '../ui';

interface Props {
  icon: IconName;
  label: string;
  value?: string;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  last?: boolean;
}

export function SettingsRow({ icon, label, value, toggle, onToggle, onPress, last }: Props) {
  const isToggle = toggle !== undefined;

  return (
    <View>
      <Pressable
        disabled={isToggle || !onPress}
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 }}
      >
        <IconTile icon={icon} bg={colors.primarySoft} color={colors.primary} size={36} iconSize={18} radius={11} />
        <Text size={16} weight="medium" style={{ flex: 1 }}>
          {label}
        </Text>
        {isToggle ? (
          <Toggle value={toggle!} onValueChange={(v) => onToggle?.(v)} />
        ) : (
          <>
            {value ? (
              <Text size={14} color={colors.textMuted}>
                {value}
              </Text>
            ) : null}
            <Icon name="chevron-right" size={20} color={colors.textFaint} />
          </>
        )}
      </Pressable>
      {!last && <View style={{ height: 1, backgroundColor: colors.border }} />}
    </View>
  );
}
