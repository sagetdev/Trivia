import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, Text as RNText, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme';
import { getCategory, getQuestions } from '../../components/data/mock';
import { formatTime } from '../../components/data/format';
import { useCountdown } from '../../hooks/useCountdown';
import { Button, CategoryTag, OptionCard, OptionState, ProgressBar } from '../../components/ui';
import { FeedbackSheet, QuizTopBar, Verdict } from '../../components/features';

const LETTERS = ['A', 'B', 'C', 'D'];
const LIFELINES = 2;
const XP_PER_QUESTION: Record<string, number> = { easy: 8, medium: 12, hard: 16 };

export default function QuizPlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; difficulty?: string; count?: string; time?: string }>();

  const category = getCategory(params.category);
  const difficulty = params.difficulty ?? 'medium';
  const total = Number(params.count) || 10;
  const timeLimit = params.time === 'none' ? null : Number(params.time) || 30;

  const questions = useMemo(() => getQuestions(total), [total]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [removed, setRemoved] = useState<number[]>([]);
  const [lifelines, setLifelines] = useState(LIFELINES);
  const [timedOut, setTimedOut] = useState(false);

  const correctCount = useRef(0);
  const startedAt = useRef(Date.now());

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const reveal = useCallback(
    (choice: number | null) => {
      if (choice !== null && choice === question.correctIndex) correctCount.current += 1;
      setRevealed(true);
    },
    [question],
  );

  const secondsLeft = useCountdown(timeLimit, !revealed, index, () => {
    setTimedOut(true);
    reveal(null);
  });

  const submit = () => {
    if (selected === null) return;
    reveal(selected);
  };

  const applyLifeline = () => {
    if (lifelines === 0 || revealed) return;
    const wrong = question.options
      .map((_, i) => i)
      .filter((i) => i !== question.correctIndex && i !== selected);
    setRemoved(wrong.sort(() => Math.random() - 0.5).slice(0, 2));
    setLifelines((n) => n - 1);
  };

  const next = () => {
    if (isLast) {
      router.replace({
        pathname: '/(quiz)/results',
        params: {
          category: category.id,
          score: String(correctCount.current),
          total: String(questions.length),
          seconds: String(Math.round((Date.now() - startedAt.current) / 1000)),
          xp: String(correctCount.current * (XP_PER_QUESTION[difficulty] ?? 12)),
        },
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setRemoved([]);
    setTimedOut(false);
  };

  const stateFor = (i: number): OptionState => {
    if (!revealed) return selected === i ? 'selected' : 'default';
    if (i === question.correctIndex) return 'correct';
    if (i === selected) return 'wrong';
    return 'default';
  };

  const verdict: Verdict = !revealed
    ? 'wrong'
    : timedOut
      ? 'timeout'
      : selected === question.correctIndex
        ? 'correct'
        : 'wrong';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 }}
      >
        <QuizTopBar
          title={`Question ${index + 1} of ${questions.length}`}
          onClose={() => router.replace('/home')}
          timer={timeLimit === null ? null : formatTime(secondsLeft)}
        />

        <ProgressBar progress={(index + 1) / questions.length} />

        <CategoryTag
          icon={category.icon}
          color={category.color}
          label={`${category.name} · ${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`}
        />

        <RNText
          style={{ fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, color: colors.text, includeFontPadding: false }}
        >
          {question.text}
        </RNText>

        <View style={{ gap: 12 }}>
          {question.options.map((option, i) => (
            <OptionCard
              key={option}
              letter={LETTERS[i]}
              label={option}
              state={stateFor(i)}
              disabled={revealed || removed.includes(i)}
              dimmed={removed.includes(i) && !revealed}
              onPress={() => setSelected(i)}
            />
          ))}
        </View>
      </ScrollView>

      {revealed ? (
        <FeedbackSheet
          verdict={verdict}
          answer={question.options[question.correctIndex]}
          explanation={question.explanation}
          isLast={isLast}
          onNext={next}
        />
      ) : (
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20) + 14, gap: 12 }}>
          <Button
            label={`Use 50:50 lifeline (${lifelines} left)`}
            variant="soft"
            disabled={lifelines === 0 || removed.length > 0}
            onPress={applyLifeline}
          />
          <Button label="Submit answer" disabled={selected === null} onPress={submit} />
        </View>
      )}
    </SafeAreaView>
  );
}
