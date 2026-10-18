import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { getCategory } from '../../components/data/mock';
import { Button, Chip, Icon, IconButton, IconTile, Text } from '../../components/ui';

const difficulties = [
  { id: 'easy', label: 'Easy', xp: 8 },
  { id: 'medium', label: 'Medium', xp: 12 },
  { id: 'hard', label: 'Hard', xp: 16 },
] as const;
const counts = [5, 10, 15, 20];
const times = [
  { id: '15', label: '15s' },
  { id: '30', label: '30s' },
  { id: '45', label: '45s' },
  { id: 'none', label: 'None' },
];

function OptionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text size={16} weight="semibold">
        {title}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>{children}</View>
    </View>
  );
}

export default function QuizSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category: categoryId } = useLocalSearchParams<{ category?: string }>();
  const category = getCategory(categoryId);
  const c = colors.category[category.color];

  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]['id']>('medium');
  const [count, setCount] = useState(10);
  const [time, setTime] = useState('30');

  const xpPerQuestion = difficulties.find((d) => d.id === difficulty)!.xp;
  const seconds = time === 'none' ? 20 : Number(time) * 0.6;
  const minutes = Math.max(1, Math.round((count * seconds) / 60));

  const start = () =>
    router.push({
      pathname: '/(quiz)/play',
      params: { category: category.id, difficulty, count: String(count), time },
    });

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
        <View style={{ gap: 24 }}>
          <IconButton icon="chevron-left" label="Back" onPress={() => router.back()} />

          <View style={{ alignItems: 'center', gap: 10, padding: 24, borderRadius: 24, backgroundColor: c.bg }}>
            <IconTile icon={category.icon} bg={colors.surface} color={c.fg} size={64} iconSize={32} radius={19} />
            <Text size={28} weight="bold">
              {category.name}
            </Text>
            <Text size={14} color={colors.textMuted}>
              {category.questions} questions · {category.players} players this week
            </Text>
          </View>

          <OptionGroup title="Difficulty">
            {difficulties.map((d) => (
              <Chip key={d.id} label={d.label} active={difficulty === d.id} onPress={() => setDifficulty(d.id)} style={{ flex: 1 }} />
            ))}
          </OptionGroup>

          <OptionGroup title="Number of questions">
            {counts.map((n) => (
              <Chip key={n} label={String(n)} active={count === n} onPress={() => setCount(n)} style={{ flex: 1 }} />
            ))}
          </OptionGroup>

          <OptionGroup title="Time per question">
            {times.map((t) => (
              <Chip key={t.id} label={t.label} active={time === t.id} onPress={() => setTime(t.id)} style={{ flex: 1 }} />
            ))}
          </OptionGroup>

          <View style={{ flexDirection: 'row', gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="clock" size={16} color={colors.textMuted} />
              <Text size={13} weight="medium" color={colors.textMuted}>
                About {minutes} min
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="zap" size={16} color={colors.primary} />
              <Text size={13} weight="medium" color={colors.textMuted}>
                +{count * xpPerQuestion} XP
              </Text>
            </View>
          </View>
        </View>

        <Button label="Start quiz" onPress={start} />
      </ScrollView>
    </SafeAreaView>
  );
}
