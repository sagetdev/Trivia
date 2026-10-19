import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, type AnswerReview } from "../../lib/api";
import { colors } from "../../theme";
import { Button, Card, Icon, IconButton, Text } from "../../components/ui";

export default function QuizReviewScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId?: string }>();
  const [answers, setAnswers] = useState<AnswerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) { setError("Identifiant de partie manquant."); setLoading(false); return; }
    api.getReview(quizId).then((result) => setAnswers(result.answers))
      .catch((e) => setError(e instanceof Error ? e.message : "Impossible de charger la correction."))
      .finally(() => setLoading(false));
  }, [quizId]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <IconButton icon="chevron-left" label="Retour" onPress={() => router.back()} />
          <Text size={26} weight="bold">Correction</Text>
        </View>
        {loading && <ActivityIndicator color={colors.primary} />}
        {error && <Text size={15} color={colors.error}>{error}</Text>}
        {!loading && !error && answers.map((item, index) => (
          <Card key={`${index}-${item.question}`} radius={18} style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text size={12} color={colors.textMuted}>Question {index + 1} · {item.difficulty}</Text>
              <Icon name={item.isCorrect ? "check" : "x"} size={20} color={item.isCorrect ? colors.success : colors.error} />
            </View>
            <Text size={17} weight="semibold">{item.question}</Text>
            {item.answers.map((option) => {
              const correct = option === item.correctAnswer;
              const selected = option === item.selectedAnswer;
              return (
                <View key={option} style={{
                  padding: 12, borderRadius: 12,
                  backgroundColor: correct ? colors.success + "18" : selected ? colors.error + "18" : colors.surface,
                  borderWidth: 1, borderColor: correct ? colors.success : selected ? colors.error : colors.border,
                }}>
                  <Text size={14} color={correct ? colors.success : selected ? colors.error : colors.text}>
                    {correct ? "✓ " : selected ? "✕ " : ""}{option}
                  </Text>
                </View>
              );
            })}
            {item.timedOut && <Text size={12} color={colors.warning}>Temps écoulé</Text>}
            <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surface, gap: 4 }}>
              <Text size={12} weight="semibold" color={colors.textMuted}>Explanation</Text>
              <Text size={13} color={colors.textMuted}>{item.explanation || "The question provider did not supply an explanation for this answer."}</Text>
            </View>
          </Card>
        ))}
        <Button label="Retour aux résultats" onPress={() => router.back()} variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  );
}
