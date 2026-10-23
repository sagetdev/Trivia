import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { findCategory } from '../../hooks/useCategories';
import { Button, Icon, IconButton, IconTile } from '../../components/ui';

type GameMode = 'classic' | 'timed' | 'daily';

const difficulties = [
  { id: 'easy', label: 'Easy', xp: 8 },
  { id: 'medium', label: 'Medium', xp: 12 },
  { id: 'hard', label: 'Hard', xp: 16 },
] as const;
const counts = [5, 10, 15, 20];
const times = [
  { id: '15', label: '15 sec' },
  { id: '30', label: '30 sec' },
  { id: '45', label: '45 sec' },
  { id: 'none', label: 'No timer' },
];

const modes: { id: GameMode; title: string; subtitle: string; icon: string }[] = [
  { id: 'classic', title: 'Classic', subtitle: 'Play at your pace', icon: 'book' },
  { id: 'timed', title: 'Time attack', subtitle: 'Quick decisions', icon: 'clock' },
  { id: 'daily', title: 'Daily challenge', subtitle: 'A fresh challenge', icon: 'star' },
];

function SectionTitle({ children, trailing }: { children: React.ReactNode; trailing?: string }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <RNText className="text-base font-semibold text-ink">{children}</RNText>
      {trailing ? <RNText className="text-xs font-medium text-muted">{trailing}</RNText> : null}
    </View>
  );
}

function Choice({ label, active, onPress, className = '' }: {
  label: string; active: boolean; onPress: () => void; className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`min-h-11 flex-1 items-center justify-center rounded-xl border px-3 py-3 ${active ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'} ${className}`}
    >
      <RNText className={`text-sm font-semibold ${active ? 'text-brand-700' : 'text-ink'}`}>{label}</RNText>
    </Pressable>
  );
}

export default function QuizSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category: categoryId } = useLocalSearchParams<{ category?: string }>();
  const category = findCategory(categoryId);
  const categoryColor = colors.category[category.color];

  const [mode, setMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]['id']>('medium');
  const [count, setCount] = useState(10);
  const [time, setTime] = useState('30');

  const effectiveTime = mode === 'timed' ? '15' : time;
  const xpPerQuestion = difficulties.find((item) => item.id === difficulty)?.xp ?? 12;
  const estimatedSeconds = effectiveTime === 'none' ? 20 : Number(effectiveTime) * 0.6;
  const minutes = Math.max(1, Math.round((count * estimatedSeconds) / 60));
  const totalXp = useMemo(() => count * xpPerQuestion, [count, xpPerQuestion]);

  const start = () => {
    router.push({
      pathname: '/(quiz)/play',
      params: {
        category: category.id,
        difficulty,
        count: String(mode === 'daily' ? 10 : count),
        time: effectiveTime,
        ...(mode === 'daily' ? { challenge: 'daily' } : {}),
      },
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 20) + 18 }}
      >
        <View className="mb-6">
          <IconButton icon="chevron-left" label="Back" onPress={() => router.back()} />
          <View className="mt-5">
            <RNText className="text-3xl font-bold tracking-tight text-ink">Set up your quiz</RNText>
            <RNText className="mt-2 text-sm leading-5 text-muted">Make it yours. Choose a mode and get ready to play.</RNText>
          </View>
        </View>

        <View className="mb-6 rounded-3xl border border-line bg-white p-4">
          <View className="flex-row items-center">
            <View className="mr-4 rounded-2xl p-3" style={{ backgroundColor: categoryColor.bg }}>
              <IconTile icon={category.icon} bg={colors.surface} color={categoryColor.fg} size={52} iconSize={25} radius={16} />
            </View>
            <View className="flex-1">
              <RNText className="text-xs font-semibold uppercase tracking-widest text-brand-700">Category</RNText>
              <RNText className="mt-1 text-xl font-bold text-ink">{category.name}</RNText>
              <RNText className="mt-1 text-sm text-muted">Questions from the active provider</RNText>
            </View>
            <Icon name="check" size={22} color={colors.primary} />
          </View>
        </View>

        <View className="mb-6">
          <SectionTitle>Choose a game mode</SectionTitle>
          <View className="gap-3">
            {modes.map((item) => {
              const active = mode === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setMode(item.id)}
                  className={`flex-row items-center rounded-2xl border p-4 ${active ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'}`}
                >
                  <View className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${active ? 'bg-brand-100' : 'bg-canvas'}`}>
                    <Icon name={item.icon} size={21} color={active ? colors.primary : colors.textMuted} />
                  </View>
                  <View className="flex-1">
                    <RNText className="text-sm font-bold text-ink">{item.title}</RNText>
                    <RNText className="mt-1 text-xs text-muted">{item.subtitle}</RNText>
                  </View>
                  <View className={`h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-brand-600 bg-brand-600' : 'border-line bg-white'}`}>
                    {active ? <Icon name="check" size={13} color="#FFFFFF" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
          {mode === 'timed' ? (
            <View className="mt-3 flex-row items-center rounded-xl bg-amber-50 p-3">
              <Icon name="zap" size={17} color="#B7791F" />
              <RNText className="ml-2 flex-1 text-xs font-medium text-amber-800">Each question has a 15-second timer in Time attack.</RNText>
            </View>
          ) : null}
        </View>

        <View className="mb-6">
          <SectionTitle>Difficulty</SectionTitle>
          <View className="flex-row gap-2">
            {difficulties.map((item) => <Choice key={item.id} label={item.label} active={difficulty === item.id} onPress={() => setDifficulty(item.id)} />)}
          </View>
        </View>

        <View className="mb-6">
          <SectionTitle trailing={mode === 'daily' ? 'Fixed for daily challenge' : undefined}>Number of questions</SectionTitle>
          <View className="flex-row gap-2">
            {counts.map((number) => <Choice key={number} label={String(number)} active={count === number && mode !== 'daily'} onPress={() => { setMode(mode === 'daily' ? 'classic' : mode); setCount(number); }} />)}
          </View>
        </View>

        <View className="mb-6">
          <SectionTitle>Time per question</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {times.map((item) => <Choice key={item.id} label={item.label} active={effectiveTime === item.id} onPress={() => { setTime(item.id); if (mode === 'timed') setMode('classic'); }} />)}
          </View>
        </View>

        <View className="mb-6 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-line bg-white p-4">
            <View className="mb-2 flex-row items-center">
              <Icon name="clock" size={17} color={colors.textMuted} />
              <RNText className="ml-2 text-xs font-medium text-muted">Estimated time</RNText>
            </View>
            <RNText className="text-xl font-bold text-ink">~{mode === 'daily' ? Math.max(1, Math.round((10 * estimatedSeconds) / 60)) : minutes} min</RNText>
          </View>
          <View className="flex-1 rounded-2xl border border-line bg-white p-4">
            <View className="mb-2 flex-row items-center">
              <Icon name="zap" size={17} color={colors.primary} />
              <RNText className="ml-2 text-xs font-medium text-muted">Possible XP</RNText>
            </View>
            <RNText className="text-xl font-bold text-ink">+{mode === 'daily' ? 10 * xpPerQuestion : totalXp} XP</RNText>
          </View>
        </View>

        <Button label={mode === 'daily' ? 'Start daily challenge' : 'Start quiz'} onPress={start} />
        <RNText className="mt-3 text-center text-xs text-muted">You can change these settings before every game.</RNText>
      </ScrollView>
    </SafeAreaView>
  );
}
