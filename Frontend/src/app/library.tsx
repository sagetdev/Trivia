import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Button, Card, Icon, IconButton, Text } from "../components/ui";
import { colors } from "../theme";
import {
  getQuestionLibrary,
  removeQuestionFromList,
  type SavedQuestion,
} from "../lib/question-library";

type LibraryTab = "favorites" | "incorrect" | "history";

const tabLabels: Record<LibraryTab, string> = {
  favorites: "Favoris",
  incorrect: "À réviser",
  history: "Historique",
};

export default function QuestionLibraryScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<LibraryTab>("favorites");
  const [library, setLibrary] = useState<{
    favorites: SavedQuestion[];
    history: SavedQuestion[];
    incorrect: SavedQuestion[];
  }>({ favorites: [], history: [], incorrect: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLibrary(await getQuestionLibrary());
    } catch {
      setError("Impossible de lire la bibliothèque de questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const questions = library[tab];

  const remove = async (item: SavedQuestion) => {
    if (tab !== "favorites" && tab !== "incorrect") return;
    try {
      await removeQuestionFromList(tab, item);
      setLibrary((current) => ({
        ...current,
        [tab]: current[tab].filter((entry) => entry.question !== item.question),
      }));
    } catch {
      setError("Impossible de modifier la bibliothèque. Réessaie.");
    }
  };

  return (
    <Screen scroll contentStyle={{ paddingBottom: 32 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <IconButton icon="chevron-left" label="Retour" onPress={() => router.back()} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text size={26} weight="bold">Bibliothèque</Text>
          <Text size={13} color={colors.textMuted}>Tes questions sauvegardées sur cet appareil</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["favorites", "incorrect", "history"] as const).map((item) => (
          <View key={item} style={{ flex: 1 }}>
            <Button
              label={tabLabels[item]}
              variant={tab === item ? "primary" : "secondary"}
              onPress={() => setTab(item)}
            />
          </View>
        ))}
      </View>

      {loading && <ActivityIndicator color={colors.primary} />}
      {error && (
        <Card radius={16} style={{ padding: 16, gap: 10 }}>
          <Text size={14} color={colors.error}>{error}</Text>
          <Button label="Réessayer" variant="secondary" onPress={() => { void load(); }} />
        </Card>
      )}

      {!loading && !error && questions.length === 0 && (
        <Card radius={18} style={{ padding: 22, alignItems: "center", gap: 10 }}>
          <Icon name={tab === "favorites" ? "star" : tab === "incorrect" ? "book" : "clock"} size={28} color={colors.textMuted} />
          <Text size={17} weight="semibold">
            {tab === "favorites" ? "Aucun favori pour l'instant" : tab === "incorrect" ? "Aucune question à réviser" : "Pas encore d'historique"}
          </Text>
          <Text size={13} color={colors.textMuted} align="center">
            {tab === "favorites"
              ? "Depuis la correction d'un quiz, ajoute les questions que tu veux retrouver ici."
              : tab === "incorrect"
                ? "Les questions ratées pendant tes corrections apparaîtront ici."
                : "Termine un quiz et ouvre sa correction pour enregistrer les questions vues."}
          </Text>
        </Card>
      )}

      {!loading && !error && questions.map((item, index) => (
        <Card key={item.question + index} radius={16} style={{ padding: 16, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text size={12} color={colors.textMuted}>{item.category} · {item.difficulty}</Text>
              <Text size={16} weight="semibold">{item.question}</Text>
            </View>
            {item.isCorrect
              ? <Icon name="check" size={20} color={colors.success} />
              : <Icon name="x" size={20} color={colors.error} />}
          </View>
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surface, gap: 5 }}>
            <Text size={12} color={colors.textMuted}>Bonne réponse</Text>
            <Text size={14} weight="semibold" color={colors.success}>{item.correctAnswer}</Text>
            {item.selectedAnswer && (
              <>
                <Text size={12} color={colors.textMuted}>Ta réponse</Text>
                <Text size={14} color={item.isCorrect ? colors.success : colors.error}>{item.selectedAnswer}</Text>
              </>
            )}
          </View>
          {item.explanation ? <Text size={13} color={colors.textMuted}>{item.explanation}</Text> : null}
          {tab !== "history" && (
            <Button
              label={tab === "favorites" ? "Retirer des favoris" : "Retirer de la liste à réviser"}
              variant="secondary"
              onPress={() => { void remove(item); }}
            />
          )}
        </Card>
      ))}
    </Screen>
  );
}
