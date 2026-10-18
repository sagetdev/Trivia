import React from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { getCategory } from '../../components/data/mock';
import { formatTime } from '../../components/data/format';
import { Button, Card, Icon, IconButton, IconName, ScoreRing, Text } from '../../components/ui';

const message = (ratio: number) => {
  if (ratio >= 0.8) return 'Great job!';
  if (ratio >= 0.5) return 'Nice effort!';
  return 'Keep practicing!';
};

export default function QuizResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; score?: string; total?: string; seconds?: string; xp?: string }>();

  const category = getCategory(params.category);
  const score = Number(params.score) || 0;
  const total = Number(params.total) || 10;
  const seconds = Number(params.seconds) || 0;
  const xp = Number(params.xp) || 0;
  const percentile = Math.min(99, Math.round((score / total) * 95));

  const stats: { icon: IconName; color: string; value: string; label: string }[] = [
    { icon: 'check', color: colors.success, value: String(score), label: 'Correct' },
    { icon: 'clock', color: colors.warning, value: formatTime(seconds), label: 'Time' },
    { icon: 'zap', color: colors.primary, value: `+${xp}`, label: 'XP earned' },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 20) + 14,
          gap: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton icon="x" label="Close" onPress={() => router.replace('/home')} />
          <Text size={15} weight="semibold" color={colors.textMuted}>
            Quiz complete
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ alignItems: 'center', gap: 24 }}>
          <ScoreRing score={score} total={total} />

          <View style={{ alignItems: 'center', gap: 8, width: '100%' }}>
            <Text size={32} weight="bold">
              {message(score / total)}
            </Text>
            <Text size={16} lineHeight={24} color={colors.textMuted} align="center">
              You scored higher than {percentile}% of players on {category.name} today.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            {stats.map((s) => (
              <Card key={s.label} radius={16} style={{ flex: 1, alignItems: 'center', gap: 4, padding: 14 }}>
                <Icon name={s.icon} size={20} color={s.color} />
                <Text size={18} weight="semibold">
                  {s.value}
                </Text>
                <Text size={12} color={colors.textMuted}>
                  {s.label}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Button
            label="Play again"
            onPress={() => router.replace({ pathname: '/quiz/setup', params: { category: category.id } })}
          />
          <Button label="Review answers" variant="secondary" />
          <Button label="Back to home" variant="ghost" onPress={() => router.replace('/home')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
