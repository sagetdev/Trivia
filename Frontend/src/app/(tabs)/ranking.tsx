import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api, type LeaderboardScope } from '../../lib/api';
import type { Player } from '../../components/data/mock';
import { usePlayer } from '../../hooks/usePlayer';
import type { CategoryColor } from '../../theme';
import { colors } from '../../theme';
import { Screen } from '../../components/Screen';
import { Button, Card, Text } from '../../components/ui';
import { PodiumItem, RankingRow } from '../../components/features';

const palette: CategoryColor[] = ['pink', 'purple', 'teal', 'orange', 'blue', 'green'];

const initialsOf = (name: string) =>
  name.split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase();

export default function RankingScreen() {
  const player = usePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getLeaderboard(scope)
      .then((list) =>
        setPlayers(
          list.map((e, i) => ({
            rank: e.rank,
            name: e.playerName,
            initials: initialsOf(e.playerName),
            score: e.score,
            total: e.total,
            color: palette[i % palette.length],
            isMe: e.playerName.toLowerCase() === player.name.toLowerCase(),
          })),
        ),
      )
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur inconnue'))
      .finally(() => setLoading(false));
  }, [player.name, scope]);

  useFocusEffect(load);

  const podium = [2, 1, 3].map((r) => players.find((p) => p.rank === r));
  const showPodium = podium.every(Boolean);
  const rest = showPodium ? players.filter((p) => p.rank > 3) : players;

  return (
    <Screen scroll>
      <Text size={28} weight="bold">
        Leaderboard
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Global" variant={scope === 'global' ? 'primary' : 'secondary'} onPress={() => setScope('global')} />
        <Button label="Last 7 days" variant={scope === 'week' ? 'primary' : 'secondary'} onPress={() => setScope('week')} />
      </View>

      {loading && <ActivityIndicator color={colors.primary} />}

      {error && (
        <View style={{ gap: 12 }}>
          <Text size={14} color={colors.textMuted}>{error}</Text>
          <Button label="Réessayer" variant="soft" onPress={load} />
        </View>
      )}

      {!loading && !error && players.length === 0 && (
        <Text size={15} color={colors.textMuted} align="center">
          No games yet — be the first!
        </Text>
      )}

      {showPodium && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          {podium.map((p) => (
            <PodiumItem key={p!.rank} player={p!} />
          ))}
        </View>
      )}

      {rest.length > 0 && (
        <Card radius={20} style={{ padding: 8, gap: 2 }}>
          {rest.map((p) => (
            <RankingRow key={p.rank} player={p} />
          ))}
        </Card>
      )}
    </Screen>
  );
}