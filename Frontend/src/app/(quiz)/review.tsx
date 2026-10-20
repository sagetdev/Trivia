import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, useReducedMotion } from 'react-native-reanimated';
import { api, type AnswerReview } from '../../lib/api';
import { colors } from '../../theme';
import { Button, Card, Icon, IconButton, Text } from '../../components/ui';

export default function QuizReviewScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId?: string }>();
  const [answers, setAnswers] = useState<AnswerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!quizId) {
      setError('Identifiant de partie manquant.');
      setLoading(false);
      return;
    }

    let active = true;
    api.getReview(quizId)
      .then((result) => { if (active) setAnswers(result.answers); })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Impossible de charger la correction.');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [quizId]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(220)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <IconButton icon="chevron-left" label="Retour" onPress={() => router.back()} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text size={26} weight="bold">Correction</Text>
            <Text size={13} color={colors.textMuted}>
              {answers.length > 0 ? `${answers.length} question${answers.length === 1 ? '' : 's'} · tes réponses et les bonnes réponses` : 'Retrouve tes réponses après la partie.'}
            </Text>
          </View>
        </Animated.View>

        {loading && (
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(180)} style={{ padding: 24, alignItems: 'center', gap: 10 }}>
            <ActivityIndicator color={colors.primary} />
            <Text size={14} color={colors.textMuted}>Chargement de la correction…</Text>
          </Animated.View>
        )}

        {error && (
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(220)}>
            <Card radius={16} style={{ padding: 16, gap: 8 }}>
              <Icon name="alert-circle" size={22} color={colors.error} />
              <Text size={15} color={colors.error}>{error}</Text>
              <Button label="Réessayer" onPress={() => {
                if (!quizId) return;
                setError(null);
                setLoading(true);
                api.getReview(quizId)
                  .then((result) => setAnswers(result.answers))
                  .catch((e) => setError(e instanceof Error ? e.message : 'Impossible de charger la correction.'))
                  .finally(() => setLoading(false));
              }} variant="secondary" />
            </Card>
          </Animated.View>
        )}

        {!loading && !error && answers.length === 0 && (
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(220)}>
            <Card radius={18} style={{ padding: 20, alignItems: 'center', gap: 10 }}>
              <Icon name="book-open" size={28} color={colors.textMuted} />
              <Text size={17} weight="semibold">Aucune réponse à afficher</Text>
              <Text size={13} color={colors.textMuted} align="center">La correction de cette partie ne contient pas encore de réponse enregistrée.</Text>
            </Card>
          </Animated.View>
        )}

        {!loading && !error && answers.map((item, index) => (
          <Animated.View
            key={`${index}-${item.question}`}
            entering={reduceMotion ? undefined : FadeInDown.delay(Math.min(index * 55, 330)).duration(240)}
          >
            <Card radius={18} style={{ padding: 16, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text size={12} color={colors.textMuted}>Question {index + 1} · {item.difficulty}</Text>
                  <Text size={12} weight="semibold" color={item.isCorrect ? colors.success : colors.error}>
                    {item.isCorrect ? 'Bonne réponse' : item.timedOut ? 'Temps écoulé' : 'À retravailler'}
                  </Text>
                </View>
                <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: item.isCorrect ? colors.success + '18' : colors.error + '18' }}>
                  <Icon name={item.isCorrect ? 'check' : 'x'} size={19} color={item.isCorrect ? colors.success : colors.error} />
                </View>
              </View>

              <Text size={17} weight="semibold">{item.question}</Text>

              <View style={{ gap: 8 }}>
                {item.answers.map((option, optionIndex) => {
                  const correct = option === item.correctAnswer;
                  const selected = option === item.selectedAnswer;
                  return (
                    <Animated.View
                      key={option}
                      entering={reduceMotion ? undefined : FadeInRight.delay(Math.min(optionIndex * 35, 140)).duration(180)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: correct ? colors.success + '18' : selected ? colors.error + '18' : colors.surface,
                        borderWidth: 1,
                        borderColor: correct ? colors.success : selected ? colors.error : colors.border,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text size={14} color={correct ? colors.success : selected ? colors.error : colors.text}>
                            {correct ? '✓ ' : selected ? '✕ ' : ''}{option}
                          </Text>
                        </View>
                        {correct && <Text size={11} weight="semibold" color={colors.success}>CORRECTE</Text>}
                        {selected && !correct && <Text size={11} weight="semibold" color={colors.error}>TA RÉPONSE</Text>}
                      </View>
                    </Animated.View>
                  );
                })}
              </View>

              {item.timedOut && <Text size={12} color={colors.warning}>Le temps est écoulé pour cette question.</Text>}

              <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surface, gap: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="lightbulb" size={16} color={colors.primary} />
                  <Text size={12} weight="semibold" color={colors.textMuted}>Explication</Text>
                </View>
                <Text size={13} lineHeight={20} color={colors.textMuted}>
                  {item.explanation || 'Aucune explication n’a été fournie pour cette question.'}
                </Text>
              </View>
            </Card>
          </Animated.View>
        ))}

        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(180).duration(220)}>
          <Button label="Retour aux résultats" onPress={() => router.back()} variant="secondary" />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
