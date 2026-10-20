import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme';
import { usePlayer } from '../../hooks/usePlayer';
import { formatNumber } from '../../components/data/format';
import { Screen } from '../../components/Screen';
import { Avatar, SectionHeader, Text } from '../../components/ui';
import { CategoryCard, DailyChallengeCard, StatCard } from '../../components/features';
import { Button } from '../../components/ui';
import { ActivityIndicator } from 'react-native';
import { useCategories } from '../../hooks/useCategories';
import { api, type DailyChallenge } from '../../lib/api';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const player = usePlayer();
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>({ date: new Date().toISOString().slice(0, 10), amount: 10, difficulty: 'medium', timePerQuestion: 30, resetTimezone: 'UTC' });
  useEffect(() => { api.getDailyChallenge().then(setDailyChallenge).catch(() => {}); }, []);
  const openCategory = (id: string) => router.push({ pathname: '/(quiz)/setup', params: { category: id } });

  const { categories, loading, error, reload } = useCategories();

  const HOME_LIMIT = 50;
  const shown = categories.slice(0, HOME_LIMIT);
  const rows: (typeof categories)[] = [];
  for (let i = 0; i < shown.length; i += 2) rows.push(shown.slice(i, i + 2));

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar initials={player.initials} size={44} bg={colors.primarySoft} fg={colors.primary} fontSize={15} />
          <View style={{ gap: 2 }}>
            <Text size={13} color={colors.textMuted}>
              {greeting()}
            </Text>
            <Text size={18} weight="semibold">
              {player.firstName}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard
          icon="flame"
          bg={colors.category.orange.bg}
          color={colors.category.orange.fg}
          value={`${player.streak} days`}
          label="Current streak"
        />
        <StatCard
          icon="zap"
          bg={colors.primarySoft}
          color={colors.primary}
          value={formatNumber(player.xp)}
          label="Total XP"
        />
      </View>

      <DailyChallengeCard onPlay={() => router.push({ pathname: '/(quiz)/play', params: { category: 'any', difficulty: dailyChallenge.difficulty, count: String(dailyChallenge.amount), time: String(dailyChallenge.timePerQuestion ?? 'none'), challenge: 'daily', challengeDate: dailyChallenge.date } })} />
      <Button label="Play with friends" variant="secondary" onPress={() => router.push('/(quiz)/multiplayer')} />

      <SectionHeader title="Categories" actionLabel="See all" onActionPress={() => router.push('/explore')} />

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : error ? (
        <View style={{ gap: 12 }}>
          <Text size={14} color={colors.textMuted}>{error}</Text>
          <Button label="Réessayer" variant="soft" onPress={reload} />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {rows.map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
              {row.map((c) => (
                <CategoryCard key={c.id} category={c} onPress={() => openCategory(c.id)} />
              ))}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
