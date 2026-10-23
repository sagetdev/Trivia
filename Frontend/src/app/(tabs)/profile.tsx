import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme';
import type { Achievement } from '../../components/data/mock';
import { usePlayer } from '../../hooks/usePlayer';
import { setPlayerName } from '../../lib/player';
import { api, type PlayerAnalytics } from '../../lib/api';
import { formatNumber } from '../../components/data/format';
import { Screen } from '../../components/Screen';
import {
  Avatar,
  Card,
  Icon,
  IconButton,
  IconTile,
  ProgressBar,
  Button,
  SectionHeader,
  Text,
} from '../../components/ui';
import { AchievementBadge } from '../../components/features';

export default function ProfileScreen() {
  const router = useRouter();
  const player = usePlayer();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [analytics, setAnalytics] = useState<PlayerAnalytics | null>(null);
  useEffect(() => { api.getStats(player.name).then(setAnalytics).catch(() => setAnalytics(null)); }, [player.name]);
  const saveName = async () => { await setPlayerName(draft); await player.refresh(); setEditing(false); };
  const totalXp = analytics?.xp ?? player.xp;
  const level = Math.floor(totalXp / 100) + 1;
  const nextLevelXp = level * 100;
  const quizCount = analytics?.quizzes ?? player.quizzes;
  const accuracy = analytics?.accuracy ?? player.accuracy;

  const achievements: Achievement[] = [
    { id: 'first', label: 'First quiz', icon: 'flame', color: 'orange', locked: quizCount < 1 },
    { id: 'perfect', label: 'Perfect', icon: 'target', color: 'purple', locked: !(analytics?.history.some((record) => record.score === record.total && record.total > 0) ?? player.stats.records.some((record) => record.score === record.total && record.total > 0)) },
    { id: 'dedicated', label: '10 quizzes', icon: 'zap', color: 'blue', locked: quizCount < 10 },
    { id: 'xp', label: '500 XP', icon: 'star', color: 'teal', locked: totalXp < 500 },
  ];

  const stats = [
    { value: String(quizCount), label: 'Quizzes' },
    { value: `${accuracy}%`, label: 'Accuracy' },
    { value: `${player.bestStreak} days`, label: 'Best streak' },
  ];

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text size={28} weight="bold">
          Profile
        </Text>
        <IconButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar initials={player.initials} size={88} bg={colors.primary} fg={colors.onPrimary} fontSize={30} />
        <Text size={22} weight="bold">
          {player.name}
        </Text>
        <Text size={14} color={colors.textMuted}>
          {player.handle} · Level {level}
        </Text>

        <View style={{ width: '100%', gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text size={13} weight="medium" color={colors.textMuted}>
              {formatNumber(totalXp)} / {formatNumber(nextLevelXp)} XP
            </Text>
            <Text size={13} weight="semibold" color={colors.primary}>
              Level {level + 1}
            </Text>
          </View>
          <ProgressBar progress={totalXp / nextLevelXp} />
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

      {analytics && analytics.quizzes > 0 && (
        <Card radius={16} style={{ padding: 16, gap: 10 }}>
          <Text size={16} weight="semibold">Server statistics</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text size={13} color={colors.textMuted}>Average quiz duration</Text>
            <Text size={13} weight="semibold">{Math.floor(analytics.averageDurationSeconds / 60)}m {analytics.averageDurationSeconds % 60}s</Text>
          </View>
          <Text size={13} color={colors.textMuted}>Mastered categories (sorted by accuracy)</Text>
          {analytics.categories.slice(0, 5).map((item) => (
            <View key={item.category} style={{ gap: 5 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text size={13}>{item.category}</Text>
                <Text size={13} weight="semibold">{item.accuracy}% · {item.quizzes} quiz{item.quizzes > 1 ? 'zes' : ''}</Text>
              </View>
              <ProgressBar progress={item.accuracy / 100} />
            </View>
          ))}
        </Card>
      )}

      <SectionHeader title="Achievements" />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {achievements.map((a) => (
          <AchievementBadge key={a.id} item={a} />
        ))}
      </View>

      <Button label="Bibliothèque de questions" variant="secondary" onPress={() => router.push("/library")} />

      <SectionHeader title="Recent quizzes" />
      {player.stats.records.length === 0 ? (
        <Text size={14} color={colors.textMuted}>Tes parties terminées apparaîtront ici.</Text>
      ) : player.stats.records.slice(0, 3).map((record) => (
        <Card key={record.quizId} radius={14} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 }}>
          <View style={{ gap: 4, flex: 1 }}>
            <Text size={14} weight="semibold">{new Date(record.finishedAt).toLocaleDateString()}</Text>
            <Text size={12} color={colors.textMuted}>{record.durationSeconds}s · +{record.xp} XP</Text>
          </View>
          <Text size={16} weight="bold">{record.score}/{record.total}</Text>
        </Card>
      ))}

      <Pressable accessibilityRole="button" onPress={() => { setDraft(player.name); setEditing((value) => !value); }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <IconTile icon="pencil" bg={colors.primarySoft} color={colors.primary} size={36} iconSize={18} radius={11} />
          <Text size={16} weight="medium" style={{ flex: 1 }}>
            Edit profile
          </Text>
          <Icon name="chevron-right" size={20} color={colors.textFaint} />
        </Card>
      </Pressable>
      {editing && (
        <View style={{ gap: 10 }}>
          <Text size={14} color={colors.textMuted}>Ton pseudo (24 caractères maximum)</Text>
          <TextInput value={draft} onChangeText={setDraft} maxLength={24} autoCapitalize="words" placeholder="Ton pseudo" placeholderTextColor={colors.textFaint} style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14 }} />
          <Button label="Enregistrer" onPress={() => { saveName().catch(() => {}); }} disabled={!draft.trim()} />
        </View>
      )}
    </Screen>
  );
}
