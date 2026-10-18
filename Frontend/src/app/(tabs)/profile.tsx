import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme';
import { achievements, user } from '../../components/data/mock';
import { formatNumber } from '../../components/data/format';
import { Screen } from '../../components/Screen';
import {
  Avatar,
  Card,
  Icon,
  IconButton,
  IconTile,
  ProgressBar,
  SectionHeader,
  Text,
} from '../../components/ui';
import { AchievementBadge } from '../../components/features';

const stats = [
  { value: String(user.quizzes), label: 'Quizzes' },
  { value: `${user.accuracy}%`, label: 'Accuracy' },
  { value: `${user.bestStreak} days`, label: 'Best streak' },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text size={28} weight="bold">
          Profile
        </Text>
        <IconButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar initials={user.initials} size={88} bg={colors.primary} fg={colors.onPrimary} fontSize={30} />
        <Text size={22} weight="bold">
          {user.name}
        </Text>
        <Text size={14} color={colors.textMuted}>
          {user.handle} · Level {user.level}
        </Text>

        <View style={{ width: '100%', gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text size={13} weight="medium" color={colors.textMuted}>
              {formatNumber(user.xp)} / {formatNumber(user.nextLevelXp)} XP
            </Text>
            <Text size={13} weight="semibold" color={colors.primary}>
              Level {user.level + 1}
            </Text>
          </View>
          <ProgressBar progress={user.xp / user.nextLevelXp} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {stats.map((s) => (
          <Card key={s.label} radius={16} style={{ flex: 1, alignItems: 'center', gap: 2, padding: 14 }}>
            <Text size={18} weight="bold" numberOfLines={1}>
              {s.value}
            </Text>
            <Text size={12} color={colors.textMuted}>
              {s.label}
            </Text>
          </Card>
        ))}
      </View>

      <SectionHeader title="Achievements" actionLabel="See all" />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {achievements.map((a) => (
          <AchievementBadge key={a.id} item={a} />
        ))}
      </View>

      <Pressable accessibilityRole="button">
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <IconTile icon="pencil" bg={colors.primarySoft} color={colors.primary} size={36} iconSize={18} radius={11} />
          <Text size={16} weight="medium" style={{ flex: 1 }}>
            Edit profile
          </Text>
          <Icon name="chevron-right" size={20} color={colors.textFaint} />
        </Card>
      </Pressable>
    </Screen>
  );
}
