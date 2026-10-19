import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme';
import { user } from '../../components/data/mock';
import { formatNumber } from '../../components/data/format';
import { Screen } from '../../components/Screen';
import { Avatar, IconButton, SectionHeader, Text } from '../../components/ui';
import { CategoryCard, DailyChallengeCard, StatCard } from '../../components/features';
import { Button } from '../../components/ui';
import { ActivityIndicator } from 'react-native';
import { useCategories } from '../../hooks/useCategories';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const openCategory = (id: string) => router.push({ pathname: '/(quiz)/setup', params: { category: id } });

  const { categories, loading, error, reload } = useCategories();
  const rows = [0, 2, 4].map((i) => categories.slice(i, i + 2)).filter((r) => r.length);

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar initials={user.initials} size={44} bg={colors.primarySoft} fg={colors.primary} fontSize={15} />
          <View style={{ gap: 2 }}>
            <Text size={13} color={colors.textMuted}>
              {greeting()}
            </Text>
            <Text size={18} weight="semibold">
              {user.firstName}
            </Text>
          </View>
        </View>
        <IconButton icon="bell" label="Notifications" />
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard
          icon="flame"
          bg={colors.category.orange.bg}
          color={colors.category.orange.fg}
          value={`${user.streak} days`}
          label="Current streak"
        />
        <StatCard
          icon="zap"
          bg={colors.primarySoft}
          color={colors.primary}
          value={formatNumber(user.xp)}
          label="Total XP"
        />
      </View>

      <DailyChallengeCard onPlay={() => openCategory('any')} />

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
