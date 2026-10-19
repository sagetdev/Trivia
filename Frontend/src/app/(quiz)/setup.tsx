import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { findCategory } from '../../hooks/useCategories';
import { Button, Chip, Icon, IconButton, IconTile, Text } from '../../components/ui';

const difficulties = [
  { id: 'easy', label: 'Easy', xp: 8 },
  { id: 'medium', label: 'Medium', xp: 12 },
  { id: 'hard', label: 'Hard', xp: 16 },
] as const;

const counts = [5, 10, 15, 20];

const modes = [
  { id: 'classic', label: 'Classic', description: 'Un quiz classique, avec la difficulté et le chrono que tu choisis.' },
  { id: 'fast', label: '60s Rush', description: 'Réponds au maximum de questions avant la fin des 60 secondes.' },
  { id: 'survival', label: 'Survie', description: 'La partie se termine après 3 mauvaises réponses.' },
  { id: 'progressive', label: 'Progressif', description: 'La difficulté augmente au fil du quiz : facile, moyen, puis difficile.' },
] as const;

const times = [
  { id: '15', label: '15 s' },
  { id: '30', label: '30 s' },
  { id: '45', label: '45 s' },
  { id: 'none', label: 'Aucun' },
] as const;

type GameModeId = (typeof modes)[number]['id'];

function OptionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text size={16} weight="semibold">{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}

export default function QuizSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category: categoryId } = useLocalSearchParams<{ category?: string }>();
  const category = findCategory(categoryId);
  const categoryColors = colors.category[category.color];

  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]['id']>('medium');
  const [count, setCount] = useState(10);
  const [time, setTime] = useState('30');
  const [gameMode, setGameMode] = useState<GameModeId>('classic');

  const selectedMode = modes.find((mode) => mode.id === gameMode) ?? modes[0];
  const isFast = gameMode === 'fast';
  const isProgressive = gameMode === 'progressive';
  const timeLabel = time === 'none' ? 'Sans chrono' : `${time} s/question`;

  const maxXp = useMemo(() => {
    if (isProgressive) {
      const easyCount = Math.ceil(count / 3);
      const hardCount = Math.floor(count / 3);
      const mediumCount = count - easyCount - hardCount;
      return easyCount * 8 + mediumCount * 12 + hardCount * 16;
    }
    const xpPerQuestion = difficulties.find((item) => item.id === difficulty)?.xp ?? 12;
    return count * xpPerQuestion;
  }, [count, difficulty, isProgressive]);

  const start = () => {
    router.push({
      pathname: '/(quiz)/play',
      params: { category: category.id, difficulty, count: String(count), time: isFast ? 'none' : time, gameMode },
    });
  };

  const chipStyle = (basis: `${number}%`) => ({ width: basis, flexGrow: 1 } as const);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 20) + 20,
          gap: 22,
        }}
      >
        <View style={{ gap: 18 }}>
          <IconButton icon="chevron-left" label="Retour" onPress={() => router.back()} />

          <View style={{ alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 22, borderRadius: 24, backgroundColor: categoryColors.bg }}>
            <IconTile icon={category.icon} bg={colors.surface} color={categoryColors.fg} size={60} iconSize={30} radius={18} />
            <Text size={26} weight="bold" align="center">{category.name}</Text>
            <Text size={14} color={colors.textMuted} align="center">
              Personnalise ta partie avant de commencer.
            </Text>
          </View>
        </View>

        <OptionGroup title="Mode de jeu">
          {modes.map((mode) => {
            const active = gameMode === mode.id;
            return (
              <View key={mode.id} style={{ width: '48%', flexGrow: 1 }}>
                <Chip
                  label={mode.label}
                  active={active}
                  onPress={() => setGameMode(mode.id)}
                  style={{ width: '100%', minHeight: 44 }}
                />
              </View>
            );
          })}
        </OptionGroup>

        <View style={{ borderRadius: 16, padding: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <Icon name={gameMode === 'fast' ? 'zap' : gameMode === 'survival' ? 'shield' : gameMode === 'progressive' ? 'activity' : 'target'} size={20} color={colors.primary} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text size={14} weight="semibold">{selectedMode.label}</Text>
            <Text size={13} color={colors.textMuted}>{selectedMode.description}</Text>
          </View>
        </View>

        {!isProgressive && (
          <OptionGroup title="Difficulté">
            {difficulties.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                active={difficulty === item.id}
                onPress={() => setDifficulty(item.id)}
                style={chipStyle('30%')}
              />
            ))}
          </OptionGroup>
        )}

        <OptionGroup title={isFast ? 'Maximum de questions' : 'Nombre de questions'}>
          {counts.map((number) => (
            <Chip
              key={number}
              label={String(number)}
              active={count === number}
              onPress={() => setCount(number)}
              style={chipStyle('21%')}
            />
          ))}
        </OptionGroup>

        {!isFast && (
          <OptionGroup title="Temps par question">
            {times.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                active={time === item.id}
                onPress={() => setTime(item.id)}
                style={chipStyle('21%')}
              />
            ))}
          </OptionGroup>
        )}

        <View style={{ borderRadius: 18, padding: 16, gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="clock" size={18} color={colors.textMuted} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text size={13} color={colors.textMuted}>Règle du chrono</Text>
              <Text size={14} weight="medium">
                {isFast ? '60 secondes au total' : time === 'none' ? 'Aucune limite par question' : timeLabel}
              </Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="zap" size={18} color={colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text size={13} color={colors.textMuted}>XP possible</Text>
              <Text size={14} weight="semibold" color={colors.primary}>Jusqu'à +{maxXp} XP</Text>
            </View>
          </View>
          {gameMode === 'survival' && (
            <Text size={12} color={colors.textMuted}>La partie peut se terminer avant d'atteindre le nombre de questions choisi.</Text>
          )}
          {isFast && (
            <Text size={12} color={colors.textMuted}>Le nombre choisi est un maximum : le chrono de 60 secondes reste prioritaire.</Text>
          )}
        </View>

        <Button label="Commencer le quiz" onPress={start} />
      </ScrollView>
    </SafeAreaView>
  );
}
