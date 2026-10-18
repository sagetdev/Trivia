
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:4000/api"
).replace(/\/+$/, "");

export interface QuizCategory {
  id: number;
  name: string;
}

export interface QuizQuestion {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple" | "boolean";
  question: string;
  answers: string[];
}

export interface QuizSession {
  quizId: string;
  totalQuestions: number;
  question: QuizQuestion | null;
}

export interface QuizResult {
  correct: boolean;
  correctAnswer: string;
  score: number;
  totalQuestions?: number;
  finished?: boolean;
  nextQuestion?: QuizQuestion | null;
}

export interface CreateQuizOptions {
  amount: number;
  categoryId?: number;
  difficulty?: "easy" | "medium" | "hard";
  type?: "multiple" | "boolean";
  playerName: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      `Impossible de joindre le serveur (${API_BASE_URL}). Vérifie que le backend est démarré et que son adresse est correcte.`,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : `Erreur API HTTP ${response.status}`,
    );
  }

  return data as T;
}

export const api = {
  health: () =>
    request<{ status: string; service: string }>("/health"),

  getCategories: () =>
    request<QuizCategory[]>("/categories"),

  createQuiz: (options: CreateQuizOptions) =>
    request<QuizSession>("/quizzes", {
      method: "POST",
      body: JSON.stringify(options),
    }),

  getQuiz: (quizId: string) =>
    request<QuizSession & { score: number; finished: boolean }>(
      `/quizzes/${encodeURIComponent(quizId)}`,
    ),

  submitAnswer: (quizId: string, answer: string) =>
    request<QuizResult>(
      `/quizzes/${encodeURIComponent(quizId)}/answers`,
      {
        method: "POST",
        body: JSON.stringify({ answer }),
      },
    ),

  getResults: (quizId: string) =>
    request<QuizResult>(
      `/quizzes/${encodeURIComponent(quizId)}/results`,
    ),

  getLeaderboard: () =>
    request<Array<{
      playerName: string;
      score: number;
      totalQuestions: number;
    }>>("/leaderboard"),
};
