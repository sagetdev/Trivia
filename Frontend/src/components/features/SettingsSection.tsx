import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import { Card, Text } from '../ui';

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text size={12} weight="semibold" color={colors.textFaint} letterSpacing={0.5}>
        {title.toUpperCase()}
      </Text>
      <Card radius={20} style={{ paddingHorizontal: 16 }}>
        {children}
      </Card>
    </View>
  );
}
