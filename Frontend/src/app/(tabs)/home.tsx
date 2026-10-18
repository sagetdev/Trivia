import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme';
import { categories, user } from '../../components/data/mock';
import { formatNumber } from '../../components/data/format';
import { Screen } from '../../components/Screen';
import { Avatar, IconButton, SectionHeader, Text } from '../../components/ui';
import { CategoryCard, DailyChallengeCard, StatCard } from '../../components/features';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const openCategory = (id: string) => router.push({ pathname: '/(quiz)/setup', params: { category: id } });

  const rows = [0, 2, 4].map((i) => categories.slice(i, i + 2));

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

      <DailyChallengeCard onPlay={() => openCategory('science')} />

      <SectionHeader title="Categories" actionLabel="See all" onActionPress={() => router.push('/explore')} />

      <View style={{ gap: 12 }}>
        {rows.map((row, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            {row.map((c) => (
              <CategoryCard key={c.id} category={c} onPress={() => openCategory(c.id)} />
            ))}
          </View>
        ))}
      </View>
    </Screen>
  );
}
