
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:4000/api"
).replace(/\/+$/, "");

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple" | "boolean";

export interface QuizCategory { id: number; name: string }

export interface QuizQuestion {
  category: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  answers: string[];
}

export interface QuizSession {
  quizId: string;
  totalQuestions: number;
  question: QuizQuestion | null;
}

export interface QuizSummary {
  quizId: string;
  playerName: string;
  score: number;
  total: number;
  finishedAt: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  answeredIndex: number;
  score: number;
  totalQuestions: number;
  finished: boolean;
  nextQuestion: QuizQuestion | null;
  result?: QuizSummary;
}

export interface LeaderboardEntry extends QuizSummary { rank: number }

export interface CreateQuizOptions {
  amount?: number;
  categoryId?: number;
  difficulty?: Difficulty;
  type?: QuestionType;
  playerName?: string;
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
  health: () => request<{ status: string; service: string }>("/health"),

  getCategories: async () =>
    (await request<{ categories: QuizCategory[] }>("/categories")).categories,

  createQuiz: (options: CreateQuizOptions) =>
    request<QuizSession>("/quizzes", { method: "POST", body: JSON.stringify(options) }),

  getQuiz: (quizId: string) =>
    request<{
      quizId: string; currentIndex: number; totalQuestions: number;
      score: number; finished: boolean; question: QuizQuestion | null;
    }>(`/quizzes/${encodeURIComponent(quizId)}`),

  submitAnswer: (quizId: string, answer: string) =>
    request<AnswerResult>(`/quizzes/${encodeURIComponent(quizId)}/answers`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  getResults: (quizId: string) =>
    request<QuizSummary>(`/quizzes/${encodeURIComponent(quizId)}/results`),

  getLeaderboard: async () =>
    (await request<{ leaderboard: LeaderboardEntry[] }>("/leaderboard")).leaderboard,
};
