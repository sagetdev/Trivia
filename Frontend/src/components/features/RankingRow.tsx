import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import type { Player } from '../data/mock';
import { formatNumber } from '../../data/format';
import { Avatar, Text } from '../ui';

export function RankingRow({ player }: { player: Player }) {
  const c = colors.category[player.color];
  const me = !!player.isMe;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: me ? colors.primarySoft : 'transparent',
      }}
    >
      <Text size={15} weight="semibold" color={me ? colors.primary : colors.textMuted} style={{ width: 22 }}>
        {player.rank}
      </Text>
      <Avatar
        initials={player.initials}
        size={40}
        bg={me ? colors.primary : c.bg}
        fg={me ? colors.onPrimary : c.fg}
        fontSize={14}
      />
      <Text size={15} weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
        {player.name}
      </Text>
      <Text size={14} weight="semibold" color={me ? colors.primary : colors.text}>
        {formatNumber(player.xp)} XP
      </Text>
    </View>
  );
}
