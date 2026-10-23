const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:4000/api").replace(/\/+$/, "");

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple" | "boolean";
export type GameMode = "classic" | "fast" | "survival" | "progressive";
export interface QuizCategory { id: number; name: string }
export interface QuizQuestion {
  category: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  answers: string[];
  source?: string;
}
export interface QuizSession { quizId: string; totalQuestions: number; question: QuizQuestion | null }
export interface QuizSummary {
  quizId: string; playerName: string; score: number; total: number; finishedAt: string;
  durationSeconds?: number; xp?: number;
}
export interface AnswerResult {
  isCorrect: boolean; timedOut?: boolean; correctAnswer: string; answeredIndex: number;
  score: number; totalQuestions: number; finished: boolean; nextQuestion: QuizQuestion | null;
  result?: QuizSummary;
}
export interface AnswerReview {
  question: string; category: string; difficulty: Difficulty; answers: string[];
  selectedAnswer: string | null; correctAnswer: string; isCorrect: boolean; timedOut: boolean; explanation?: string;
}
export interface LeaderboardEntry extends QuizSummary { rank: number; accuracy?: number }
export interface PlayerAnalytics {
  playerName: string; quizzes: number; xp: number; correctAnswers: number; totalQuestions: number;
  accuracy: number; averageDurationSeconds: number;
  categories: { category: string; quizzes: number; correct: number; total: number; accuracy: number }[];
  difficultyStats?: { difficulty: Difficulty; quizzes: number; correct: number; total: number; accuracy: number }[];
  activity?: { date: string; quizzes: number; correct: number; total: number; xp: number }[];
  history: LeaderboardEntry[];
}
export type LeaderboardScope = "global" | "week" | "category" | "friends";
export interface DailyChallenge { date: string; amount: number; difficulty: Difficulty; timePerQuestion: number | null; resetTimezone: string }
export interface RoomPlayer { id: string; name: string; score: number; answers: number; isYou?: boolean }
export interface RoomSnapshot {
  code: string; status: "waiting" | "playing" | "finished"; createdAt: string; difficulty: Difficulty;
  amount: number; currentIndex: number; totalQuestions: number; players: RoomPlayer[];
  question: QuizQuestion | null; playerId?: string;
}
export interface CreateQuizOptions {
  amount?: number; categoryId?: number; difficulty?: Difficulty; type?: QuestionType;
  playerName?: string; timePerQuestion?: number | null; gameMode?: GameMode; challengeDate?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { Accept: "application/json", "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error(`Impossible de joindre le serveur (${API_BASE_URL}). Vérifie le backend et son adresse.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : `Erreur API HTTP ${response.status}`);
  }
  return data as T;
}

export const api = {
  health: () => request<{ status: string; service: string }>("/health"),
  getConfig: () => request<{ provider: string; supportedTypes: QuestionType[] }>("/config"),
  getCategories: async () => (await request<{ categories: QuizCategory[]; provider: string }>("/categories")),
  createQuiz: (options: CreateQuizOptions) => request<QuizSession>("/quizzes", { method: "POST", body: JSON.stringify(options) }),
  getQuiz: (quizId: string) => request<{ quizId: string; currentIndex: number; totalQuestions: number; score: number; finished: boolean; question: QuizQuestion | null }>(`/quizzes/${encodeURIComponent(quizId)}`),
  submitAnswer: (quizId: string, answer: string, questionIndex: number) =>
    request<AnswerResult>(`/quizzes/${encodeURIComponent(quizId)}/answers`, { method: "POST", body: JSON.stringify({ answer, questionIndex }) }),
  getResults: (quizId: string) => request<QuizSummary>(`/quizzes/${encodeURIComponent(quizId)}/results`),
  getReview: (quizId: string) => request<{ quizId: string; score: number; total: number; answers: AnswerReview[] }>(`/quizzes/${encodeURIComponent(quizId)}/review`),
  getLeaderboard: async (scope: LeaderboardScope = "global", category?: string, players?: string[]) => {
    const params = new URLSearchParams({ scope });
    if (category) params.set("category", category);
    if (players?.length) params.set("players", players.join(","));
    return (await request<{ leaderboard: LeaderboardEntry[] }>(`/leaderboard?${params.toString()}`)).leaderboard;
  },
  getStats: (playerName: string) => request<PlayerAnalytics>(`/stats?playerName=${encodeURIComponent(playerName)}`),
  getDailyChallenge: () => request<DailyChallenge>("/daily-challenge"),
  createRoom: (options: CreateQuizOptions) => request<RoomSnapshot>("/rooms", { method: "POST", body: JSON.stringify(options) }),
  joinRoom: (code: string, playerName: string) => request<RoomSnapshot>(`/rooms/${encodeURIComponent(code)}/join`, { method: "POST", body: JSON.stringify({ playerName }) }),
  startRoom: (code: string, playerId: string) => request<RoomSnapshot>(`/rooms/${encodeURIComponent(code)}/start`, { method: "POST", body: JSON.stringify({ playerId }) }),
  getRoom: (code: string, playerId?: string) => request<RoomSnapshot>(`/rooms/${encodeURIComponent(code)}${playerId ? `?playerId=${encodeURIComponent(playerId)}` : ""}`),
  submitRoomAnswer: (code: string, playerId: string, answer: string, questionIndex: number) =>
    request<{ correct: boolean; correctAnswer: string; allAnswered: boolean; room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/answers`, { method: "POST", body: JSON.stringify({ playerId, answer, questionIndex }) }),
  getRoomResults: (code: string) => request<{ code: string; results: { rank: number; playerName: string; score: number; total: number }[] }>(`/rooms/${encodeURIComponent(code)}/results`),
  getHistory: async (playerName: string) => (await request<{ history: LeaderboardEntry[] }>(`/history?playerName=${encodeURIComponent(playerName)}`)).history,
};
