import type { Difficulty, QuestionType, QuizQuestion } from "./opentdb.service";

const BASE_URL = "https://the-trivia-api.com/v2";

const CATEGORIES = [
  { id: 101, slug: "general_knowledge", name: "General Knowledge" },
  { id: 102, slug: "science", name: "Science" },
  { id: 103, slug: "history", name: "History" },
  { id: 104, slug: "geography", name: "Geography" },
  { id: 105, slug: "film_and_tv", name: "Film & TV" },
  { id: 106, slug: "music", name: "Music" },
  { id: 107, slug: "arts_and_literature", name: "Arts & Literature" },
  { id: 108, slug: "sport_and_leisure", name: "Sport & Leisure" },
  { id: 109, slug: "society_and_culture", name: "Society & Culture" },
  { id: 110, slug: "food_and_drink", name: "Food & Drink" },
] as const;

interface TriviaApiQuestion {
  category: string;
  difficulty: Difficulty;
  question: { text: string };
  correctAnswer: string;
  incorrectAnswers: string[];
  type: string;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export async function getCategories(): Promise<{ id: number; name: string }[]> {
  return CATEGORIES.map(({ id, name }) => ({ id, name }));
}

export async function getQuestions(options: {
  amount: number;
  categoryId?: number;
  difficulty?: Difficulty;
  type?: QuestionType;
}): Promise<QuizQuestion[]> {
  if (options.type === "boolean") {
    throw new Error("Le type Vrai/Faux n'est pas disponible avec cette source de questions.");
  }

  const params = new URLSearchParams({ limit: String(options.amount) });

  if (options.categoryId !== undefined) {
    const category = CATEGORIES.find((c) => c.id === options.categoryId);

    if (!category) {
      throw new Error("Catégorie inconnue pour cette source de questions.");
    }

    params.set("categories", category.slug);
  }

  if (options.difficulty) {
    params.set("difficulties", options.difficulty);
  }

  const headers: Record<string, string> = { Accept: "application/json" };

  if (process.env.TRIVIA_API_KEY) {
    headers["X-API-Key"] = process.env.TRIVIA_API_KEY;
  }

  const response = await fetch(`${BASE_URL}/questions?${params.toString()}`, {
    headers,
    signal: AbortSignal.timeout(10000),
  });

  if (response.status === 429) {
    throw new Error("Trop de requêtes vers The Trivia API. Réessaie dans quelques secondes.");
  }

  if (!response.ok) {
    throw new Error(`The Trivia API a répondu HTTP ${response.status}`);
  }

  const data = (await response.json()) as TriviaApiQuestion[];
  const items = data.filter((q) => q.type === "text_choice");

  if (items.length === 0) {
    throw new Error("Aucune question disponible pour ces filtres.");
  }

  return items.map((item) => ({
    category: CATEGORIES.find((c) => c.slug === item.category)?.name ?? item.category,
    difficulty: item.difficulty,
    type: "multiple" as QuestionType,
    question: item.question.text,
    correctAnswer: item.correctAnswer,
    answers: shuffle([item.correctAnswer, ...item.incorrectAnswers]),
  }));
}