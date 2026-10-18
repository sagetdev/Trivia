import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import type { Player } from '../data/mock';
import { formatNumber } from '../../data/format';
import { Avatar, Text } from '../ui';

const barHeight: Record<number, number> = { 1: 88, 2: 64, 3: 48 };

export function PodiumItem({ player }: { player: Player }) {
  const first = player.rank === 1;
  const c = colors.category[player.color];

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Avatar initials={player.initials} size={first ? 64 : 52} bg={c.bg} fg={c.fg} fontSize={first ? 20 : 16} />
      <Text size={14} weight="semibold" numberOfLines={1}>
        {player.name}
      </Text>
      <Text size={12} color={colors.textMuted}>
        {formatNumber(player.xp)} XP
      </Text>
      <View
        style={{
          width: '100%',
          height: barHeight[player.rank],
          marginTop: 4,
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          backgroundColor: first ? colors.primary : colors.primarySoft,
        }}
      >
        <Text size={22} weight="bold" color={first ? colors.onPrimary : colors.primary}>
          {player.rank}
        </Text>
      </View>
    </View>
  );
}
