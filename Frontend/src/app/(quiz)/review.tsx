import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, type AnswerReview } from '../../lib/api';
import { colors } from '../../theme';
import { Button, Icon, IconButton } from '../../components/ui';

export default function QuizReviewScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId?: string }>();
  const [answers, setAnswers] = useState<AnswerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setError('Game ID is missing.');
      setLoading(false);
      return;
    }
    api.getReview(quizId)
      .then((result) => setAnswers(result.answers))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the review.'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const missedCount = answers.length - correctCount;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="mb-6 flex-row items-center">
          <IconButton icon="chevron-left" label="Back" onPress={() => router.back()} />
          <View className="ml-3 flex-1">
            <RNText className="text-2xl font-bold text-ink">Review answers</RNText>
            <RNText className="mt-1 text-sm text-muted">Learn from every question.</RNText>
          </View>
        </View>

        {loading ? (
          <View className="items-center rounded-3xl border border-line bg-white p-8">
            <ActivityIndicator color={colors.primary} />
            <RNText className="mt-3 text-sm text-muted">Loading your answers…</RNText>
          </View>
        ) : null}

        {error ? (
          <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <RNText className="text-sm font-medium text-danger">{error}</RNText>
          </View>
        ) : null}

        {!loading && !error ? (
          <>
            <View className="mb-6 rounded-3xl bg-brand-600 p-5">
              <RNText className="text-sm font-medium text-violet-100">YOUR PROGRESS</RNText>
              <RNText className="mt-2 text-3xl font-bold text-white">{correctCount} / {answers.length} correct</RNText>
              <View className="mt-4 h-2 overflow-hidden rounded-full bg-violet-400">
                <View className="h-full rounded-full bg-white" style={{ width: answers.length ? `${(correctCount / answers.length) * 100}%` : '0%' }} />
              </View>
              <View className="mt-4 flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-violet-500/60 p-3">
                  <RNText className="text-xs text-violet-100">Correct answers</RNText>
                  <RNText className="mt-1 text-xl font-bold text-white">{correctCount}</RNText>
                </View>
                <View className="flex-1 rounded-2xl bg-violet-500/60 p-3">
                  <RNText className="text-xs text-violet-100">To review</RNText>
                  <RNText className="mt-1 text-xl font-bold text-white">{missedCount}</RNText>
                </View>
              </View>
            </View>

            {answers.length === 0 ? (
              <View className="items-center rounded-3xl border border-line bg-white p-7">
                <Icon name="book" size={30} color={colors.textMuted} />
                <RNText className="mt-3 text-base font-semibold text-ink">No answers to review yet</RNText>
              </View>
            ) : answers.map((item, index) => (
              <View key={`${index}-${item.question}`} className="mb-4 rounded-3xl border border-line bg-white p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <RNText className="text-xs font-semibold uppercase tracking-wider text-muted">Question {index + 1} · {item.difficulty}</RNText>
                  <View className={`flex-row items-center rounded-full px-2.5 py-1 ${item.isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <Icon name={item.isCorrect ? 'check' : 'x'} size={14} color={item.isCorrect ? colors.success : colors.error} />
                    <RNText className={`ml-1 text-xs font-semibold ${item.isCorrect ? 'text-success' : 'text-danger'}`}>{item.isCorrect ? 'Correct' : 'Review'}</RNText>
                  </View>
                </View>
                <RNText className="mb-4 text-base font-semibold leading-6 text-ink">{item.question}</RNText>
                <View className="gap-2">
                  {item.answers.map((option) => {
                    const correct = option === item.correctAnswer;
                    const selected = option === item.selectedAnswer;
                    const style = correct
                      ? 'border-emerald-300 bg-emerald-50'
                      : selected
                        ? 'border-red-300 bg-red-50'
                        : 'border-line bg-white';
                    const textStyle = correct ? 'text-success' : selected ? 'text-danger' : 'text-ink';
                    return (
                      <View key={option} className={`flex-row items-center rounded-xl border p-3 ${style}`}>
                        <View className="mr-2 w-5 items-center">
                          {correct ? <Icon name="check" size={16} color={colors.success} /> : selected ? <Icon name="x" size={16} color={colors.error} /> : null}
                        </View>
                        <RNText className={`flex-1 text-sm leading-5 ${textStyle}`}>{option}</RNText>
                        {correct ? <RNText className="ml-2 text-xs font-semibold text-success">Correct answer</RNText> : null}
                        {!correct && selected ? <RNText className="ml-2 text-xs font-semibold text-danger">Your answer</RNText> : null}
                      </View>
                    );
                  })}
                </View>
                {item.timedOut ? <RNText className="mt-3 text-xs font-medium text-amber-700">Time ran out on this question.</RNText> : null}
              </View>
            ))}
            <Button label="Back to results" onPress={() => router.back()} variant="secondary" />
            <Pressable onPress={() => router.replace('/home')} className="mt-3 items-center py-3">
              <RNText className="text-sm font-semibold text-brand-700">Go to home</RNText>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
