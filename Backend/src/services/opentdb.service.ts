import { decode as htmlDecode } from "he";

const BASE_URL = "https://opentdb.com";

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple" | "boolean";

export interface QuizQuestion {
  category: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  answers: string[];
}

interface OpenTDBCategory {
  id: number;
  name: string;
}

interface OpenTDBQuestion {
  category: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OpenTDBResponse<T> {
  response_code: number;
  results?: T[];
  trivia_categories?: OpenTDBCategory[];
}

let categoriesCache:
  | { expiresAt: number; data: OpenTDBCategory[] }
  | undefined;

let lastQuestionRequest = 0;
let questionQueue: Promise<void> = Promise.resolve();

function decode(value: string): string {
  return htmlDecode(value);
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`OpenTDB a répondu HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getCategories(): Promise<OpenTDBCategory[]> {
  if (categoriesCache && categoriesCache.expiresAt > Date.now()) {
    return categoriesCache.data;
  }

  const data = await request<OpenTDBResponse<never>>(
    `${BASE_URL}/api_category.php`,
  );

  if (data.response_code !== 0 || !data.trivia_categories) {
    throw new Error("Impossible de récupérer les catégories OpenTDB.");
  }

  categoriesCache = {
    data: data.trivia_categories,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  return data.trivia_categories;
}

async function waitForQuestionSlot(): Promise<void> {
  const task = questionQueue.then(async () => {
    const wait = Math.max(0, 5000 - (Date.now() - lastQuestionRequest));

    if (wait > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, wait));
    }

    lastQuestionRequest = Date.now();
  });

  questionQueue = task.catch(() => {});
  await task;
}

export async function getQuestions(options: {
  amount: number;
  categoryId?: number;
  difficulty?: Difficulty;
  type?: QuestionType;
}): Promise<QuizQuestion[]> {
  await waitForQuestionSlot();

  const params = new URLSearchParams({
    amount: String(options.amount),
  });

  if (options.categoryId !== undefined) {
    params.set("category", String(options.categoryId));
  }

  if (options.difficulty) {
    params.set("difficulty", options.difficulty);
  }

  if (options.type) {
    params.set("type", options.type);
  }

  const data = await request<OpenTDBResponse<OpenTDBQuestion>>(
    `${BASE_URL}/api.php?${params.toString()}`,
  );

  if (data.response_code === 1) {
    throw new Error(
      "Pas assez de questions pour ces filtres. Essaie une autre catégorie ou difficulté.",
    );
  }

  if (data.response_code === 5) {
    throw new Error("OpenTDB limite les requêtes. Réessaie dans quelques secondes.");
  }

  if (data.response_code !== 0 || !data.results) {
    throw new Error(`Réponse OpenTDB invalide (code ${data.response_code}).`);
  }

  return data.results.map((item) => {
    const correctAnswer = decode(item.correct_answer);
    const answers = shuffle([
      correctAnswer,
      ...item.incorrect_answers.map(decode),
    ]);

    return {
      category: decode(item.category),
      difficulty: item.difficulty,
      type: item.type,
      question: decode(item.question),
      correctAnswer,
      answers,
    };
  });
}