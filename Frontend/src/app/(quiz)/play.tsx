import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text as RNText, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme';
import { api, type QuizQuestion, type QuizSummary } from '../../lib/api';
import { findCategory, shortName } from '../../hooks/useCategories';
import { user } from '../../components/data/mock';
import { formatTime } from '../../components/data/format';
import { useCountdown } from '../../hooks/useCountdown';
import { Button, CategoryTag, OptionCard, OptionState, ProgressBar, Text } from '../../components/ui';
import { FeedbackSheet, QuizTopBar, Verdict } from '../../components/features';

const LETTERS = ['A', 'B', 'C', 'D'];
const XP_PER_QUESTION: Record<string, number> = { easy: 8, medium: 12, hard: 16 };
const SHOW_SOURCE = __DEV__; // temporaire : visible seulement en développement

export default function QuizPlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; difficulty?: string; count?: string; time?: string }>();

  const categoryId = params.category && params.category !== 'any' ? Number(params.category) : undefined;
  const category = findCategory(params.category);
  const difficulty = (['easy', 'medium', 'hard'].includes(params.difficulty ?? '') ? params.difficulty : 'medium') as
    | 'easy'
    | 'medium'
    | 'hard';
  const amount = Number(params.count) || 10;
  const timeLimit = params.time === 'none' ? null : Number(params.time) || 30;

  const [quizId, setQuizId] = useState<string | null>(null);
  const [total, setTotal] = useState(amount);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nextQuestion = useRef<QuizQuestion | null>(null);
  const finalResult = useRef<QuizSummary | null>(null);
  const startedAt = useRef(Date.now());
  const booted = useRef(false);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await api.createQuiz({ amount, categoryId, difficulty, playerName: user.firstName, timePerQuestion: timeLimit });
      setQuizId(session.quizId);
      setTotal(session.totalQuestions);
      setQuestion(session.question);
      startedAt.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [amount, categoryId, difficulty]);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    start();
  }, [start]);

  const send = useCallback(
    async (answer: string, isTimeout: boolean) => {
      if (!quizId || submitting) return;
      setSubmitting(true);
      try {
        const res = await api.submitAnswer(quizId, answer, index);
        nextQuestion.current = res.nextQuestion;
        finalResult.current = res.finished && res.result ? res.result : null;
        setTimedOut(isTimeout || Boolean(res.timedOut));
        setFeedback({ isCorrect: res.isCorrect, correctAnswer: res.correctAnswer });
        setRevealed(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
      } finally {
        setSubmitting(false);
      }
    },
    [quizId, submitting, index],
  );

  const secondsLeft = useCountdown(timeLimit, !!question && !revealed && !submitting && !error, index, () =>
    send('', true),
  );

  const submit = () => {
    if (selected === null || !question) return;
    send(question.answers[selected], false);
  };

  const next = () => {
    const done = finalResult.current;
    if (done) {
      router.replace({
        pathname: '/(quiz)/results',
        params: {
          category: params.category ?? 'any',
          quizId: done.quizId,
          score: String(done.score),
          total: String(done.total),
          seconds: String(Math.round((Date.now() - startedAt.current) / 1000)),
          xp: String(done.score * (XP_PER_QUESTION[difficulty] ?? 12)),
        },
      });
      return;
    }
    setQuestion(nextQuestion.current);
    nextQuestion.current = null;
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setFeedback(null);
    setTimedOut(false);
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 16 }}>
          <Text size={20} weight="bold" align="center">
            Oups
          </Text>
          <Text size={15} color={colors.textMuted} align="center">
            {error}
          </Text>
          {!quizId && <Button label="Réessayer" onPress={start} />}
          <Button label="Back to home" variant="secondary" onPress={() => router.replace('/home')} />
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !question) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }}>
          <ActivityIndicator color={colors.primary} />
          <Text size={14} color={colors.textMuted} align="center">
            Création de la partie… le premier lancement peut prendre jusqu’à 30 s.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLast = index === total - 1;

  const stateFor = (i: number): OptionState => {
    if (!revealed || !feedback) return selected === i ? 'selected' : 'default';
    if (question.answers[i] === feedback.correctAnswer) return 'correct';
    if (i === selected) return 'wrong';
    return 'default';
  };

  const verdict: Verdict = !revealed || !feedback ? 'wrong' : timedOut ? 'timeout' : feedback.isCorrect ? 'correct' : 'wrong';
  const difficultyLabel = `${question.difficulty.charAt(0).toUpperCase()}${question.difficulty.slice(1)}`;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 }}
      >
        <QuizTopBar
          title={`Question ${index + 1} of ${total}`}
          onClose={() => router.replace('/home')}
          timer={timeLimit === null ? null : formatTime(secondsLeft)}
        />

        <ProgressBar progress={(index + 1) / total} />

        <CategoryTag
          icon={category.icon}
          color={category.color}
          label={`${shortName(question.category)} · ${difficultyLabel}`}
        />

        {SHOW_SOURCE && question.source ? (
          <Text size={11} color={colors.textFaint}>
            Source : {question.source}
          </Text> 
        ) : null}

        <RNText
          style={{ fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, color: colors.text, includeFontPadding: false }}
        >
          {question.question}
        </RNText>

        <View style={{ gap: 12 }}>
          {question.answers.map((option, i) => (
            <OptionCard
              key={`${i}-${option}`}
              letter={LETTERS[i]}
              label={option}
              state={stateFor(i)}
              disabled={revealed || submitting}
              onPress={() => setSelected(i)}
            />
          ))}
        </View>
      </ScrollView>

      {revealed && feedback ? (
        <FeedbackSheet
          verdict={verdict}
          answer={feedback.correctAnswer}
          isLast={isLast}
          onNext={next}
        />
      ) : (
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20) + 14 }}>
          <Button
            label={submitting ? 'Vérification…' : 'Submit answer'}
            disabled={selected === null || submitting}
            onPress={submit}
          />
        </View>
      )}
    </SafeAreaView>
  );
}