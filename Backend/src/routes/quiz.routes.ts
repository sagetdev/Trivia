import { Router, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import {
  getCategories,
  getQuestions,
  providerName,
  type QuizQuestion,
  type Difficulty,
  type QuestionType,
} from "../services/questions.service";
import { readPersistentState, writePersistentState } from "../services/persistence.service";

const router = Router();

interface AnswerReview {
  question: string;
  category: string;
  difficulty: Difficulty;
  answers: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  timedOut: boolean;
  explanation?: string;
}

interface QuizSession {
  id: string;
  playerName: string;
  categoryName: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  startedAt: string;
  questionStartedAt: number;
  timePerQuestion: number | null;
  gameMode: "classic" | "fast" | "survival" | "progressive";
  overallDeadlineAt: number | null;
  mistakes: number;
  challengeDate?: string;
  answers: AnswerReview[];
  finishedAt?: string;
}

interface LeaderboardEntry {
  quizId: string;
  playerName: string;
  score: number;
  total: number;
  accuracy: number;
  durationSeconds: number;
  finishedAt: string;
  category?: string;
  xp?: number;
  challengeDate?: string;
}

const sessions = new Map<string, QuizSession>();
const leaderboard: LeaderboardEntry[] = [];
const dailyQuestionCache = new Map<string, QuizQuestion[]>();
let initialized = false;
let persistQueue: Promise<void> = Promise.resolve();

async function persist(): Promise<void> {
  const snapshot = {
    sessions: [...sessions.entries()],
    leaderboard: [...leaderboard],
  };
  persistQueue = persistQueue.catch(() => {}).then(() => writePersistentState(snapshot));
  await persistQueue;
}

export async function initializeQuizRoutes(): Promise<void> {
  if (initialized) return;
  const saved = await readPersistentState();
  for (const [id, session] of saved.sessions) {
    if (session && typeof session === "object") sessions.set(id, session as QuizSession);
  }
  for (const entry of saved.leaderboard) {
    if (entry && typeof entry === "object") leaderboard.push(entry as LeaderboardEntry);
  }
  leaderboard.sort((a, b) => b.accuracy - a.accuracy || b.score - a.score);
  leaderboard.splice(1000);
  initialized = true;
}

function publicQuestion(question: QuizQuestion) {
  return {
    category: question.category,
    difficulty: question.difficulty,
    type: question.type,
    question: question.question,
    answers: question.answers,
    source: providerName,
  };
}

function getSession(id: string, res: Response): QuizSession | undefined {
  const session = sessions.get(id);
  if (!session) {
    res.status(404).json({ error: "Partie introuvable." });
    return undefined;
  }
  return session;
}

function currentQuestion(session: QuizSession) {
  const question = session.questions[session.currentIndex];
  return question ? publicQuestion(question) : null;
}

function calculateXp(session: QuizSession): number {
  return session.answers.reduce((sum, answer) => {
    if (!answer.isCorrect) return sum;
    return sum + (answer.difficulty === "easy" ? 8 : answer.difficulty === "hard" ? 16 : 12);
  }, 0);
}

function pruneSessions(): void {
  if (sessions.size <= 500) return;
  const oldestFirst = [...sessions.values()].sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
  while (sessions.size > 500 && oldestFirst.length) {
    sessions.delete(oldestFirst.shift()!.id);
  }
}

router.get("/config", (_req, res) => {
  res.json({ provider: providerName, supportedTypes: providerName === "The Trivia API" ? ["multiple"] : ["multiple", "boolean"] });
});

router.get("/categories", async (_req, res) => {
  try {
    res.json({ categories: await getCategories(), provider: providerName });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Impossible de récupérer les catégories." });
  }
});

router.post("/quizzes", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const challengeDate = typeof body.challengeDate === "string" ? body.challengeDate : undefined;
  const dailyDifficulty = (date: string): Difficulty => {
    const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return (["easy", "medium", "hard"] as const)[seed % 3];
  };
  if (challengeDate && challengeDate !== new Date().toISOString().slice(0, 10)) {
    res.status(400).json({ error: "Le défi quotidien doit correspondre à la date UTC actuelle." }); return;
  }
  if (challengeDate && leaderboard.some((entry) => entry.playerName.toLowerCase() === String(body.playerName ?? "Joueur").trim().toLowerCase() && entry.challengeDate === challengeDate)) {
    res.status(409).json({ error: "Tu as déjà terminé le défi quotidien aujourd'hui." }); return;
  }
  const amount = challengeDate ? 10 : body.amount ?? 10;
  const categoryId = challengeDate ? undefined : body.categoryId;
  const difficulty = challengeDate ? dailyDifficulty(challengeDate) : body.difficulty;
  const type = body.type;
  const playerName = body.playerName ?? "Joueur";
  const gameMode = challengeDate ? "classic" : body.gameMode ?? "classic";
  const timePerQuestion = challengeDate ? 30 : body.timePerQuestion === null || body.timePerQuestion === undefined
    ? null
    : body.timePerQuestion;

  if (typeof amount !== "number" || !Number.isInteger(amount) || amount < 1 || amount > 20) {
    res.status(400).json({ error: "amount doit être un entier entre 1 et 20." }); return;
  }
  if (categoryId !== undefined && (typeof categoryId !== "number" || !Number.isInteger(categoryId) || categoryId < 1)) {
    res.status(400).json({ error: "categoryId invalide." }); return;
  }
  if (difficulty !== undefined && !["easy", "medium", "hard"].includes(String(difficulty))) {
    res.status(400).json({ error: "difficulty invalide." }); return;
  }
  if (type !== undefined && !["multiple", "boolean"].includes(String(type))) {
    res.status(400).json({ error: "type invalide." }); return;
  }
  if (!["classic", "fast", "survival", "progressive"].includes(String(gameMode))) { res.status(400).json({ error: "gameMode invalide." }); return; }
  if (timePerQuestion !== null && (typeof timePerQuestion !== "number" || ![15, 30, 45].includes(timePerQuestion))) {
    res.status(400).json({ error: "timePerQuestion doit être 15, 30, 45 ou null." }); return;
  }
  if (typeof playerName !== "string" || playerName.trim().length < 1 || playerName.trim().length > 30) {
    res.status(400).json({ error: "playerName doit contenir 1 à 30 caractères." }); return;
  }

  try {
    let questions: QuizQuestion[];
    if (gameMode === "progressive") {
      const easyCount = Math.ceil(amount / 3);
      const hardCount = Math.floor(amount / 3);
      const mediumCount = amount - easyCount - hardCount;
      const [easy, medium, hard] = await Promise.all([
        getQuestions({ amount: easyCount, categoryId: categoryId as number | undefined, difficulty: "easy", type: type as QuestionType | undefined }),
        mediumCount ? getQuestions({ amount: mediumCount, categoryId: categoryId as number | undefined, difficulty: "medium", type: type as QuestionType | undefined }) : Promise.resolve([]),
        hardCount ? getQuestions({ amount: hardCount, categoryId: categoryId as number | undefined, difficulty: "hard", type: type as QuestionType | undefined }) : Promise.resolve([]),
      ]);
      questions = [...easy, ...medium, ...hard];
    } else if (challengeDate) {
      const cachedQuestions = dailyQuestionCache.get(challengeDate);
      if (cachedQuestions) questions = cachedQuestions;
      else {
        questions = await getQuestions({
          amount: 10,
          categoryId: undefined,
          difficulty: difficulty as Difficulty,
          type: "multiple",
        });
        dailyQuestionCache.set(challengeDate, questions);
      }
    } else {
      questions = await getQuestions({
        amount,
        categoryId: categoryId as number | undefined,
        difficulty: difficulty as Difficulty | undefined,
        type: type as QuestionType | undefined,
      });
    }
    if (!questions.length) {
      res.status(502).json({ error: "Le fournisseur n'a retourné aucune question." }); return;
    }
    const id = randomUUID();
    const now = Date.now();
    const session: QuizSession = {
      id,
      playerName: playerName.trim(),
      categoryName: categoryId === undefined ? "Mixed" : questions[0]?.category ?? "Mixed",
      questions,
      currentIndex: 0,
      score: 0,
      startedAt: new Date(now).toISOString(),
      questionStartedAt: now,
      timePerQuestion: gameMode === "fast" ? null : timePerQuestion as number | null,
      gameMode: gameMode as QuizSession["gameMode"],
      overallDeadlineAt: gameMode === "fast" ? now + 60_000 : null,
      mistakes: 0,
      challengeDate,
      answers: [],
    };
    sessions.set(id, session);
    pruneSessions();
    await persist();
    res.status(201).json({ quizId: id, totalQuestions: questions.length, question: publicQuestion(questions[0]) });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Impossible de créer la partie." });
  }
});

router.get("/quizzes/:id", (req, res) => {
  const session = getSession(req.params.id, res);
  if (!session) return;
  res.json({
    quizId: session.id,
    currentIndex: session.currentIndex,
    totalQuestions: session.questions.length,
    score: session.score,
    finished: Boolean(session.finishedAt),
    question: currentQuestion(session),
    timePerQuestion: session.timePerQuestion,
    questionStartedAt: session.questionStartedAt,
  });
});

router.post("/quizzes/:id/answers", async (req, res) => {
  const session = getSession(req.params.id, res);
  if (!session) return;
  if (session.finishedAt) {
    res.status(409).json({ error: "Cette partie est terminée." }); return;
  }

  const answer = req.body?.answer;
  const questionIndex = req.body?.questionIndex;
  if (typeof answer !== "string") {
    res.status(400).json({ error: "answer doit être une chaîne de caractères." }); return;
  }
  if (!Number.isInteger(questionIndex) || questionIndex !== session.currentIndex) {
    res.status(409).json({ error: "Cette réponse concerne une ancienne question. Synchronise la partie avant de continuer." }); return;
  }

  const question = session.questions[session.currentIndex];
  if (!question) {
    res.status(409).json({ error: "Aucune question disponible." }); return;
  }

  const overallTimedOut = session.overallDeadlineAt !== null && Date.now() > session.overallDeadlineAt;
  const timedOut = overallTimedOut || (session.timePerQuestion !== null &&
    Date.now() - session.questionStartedAt > session.timePerQuestion * 1000);
  if (!timedOut && answer !== "" && !question.answers.includes(answer)) {
    res.status(400).json({ error: "La réponse ne fait pas partie des choix proposés." }); return;
  }

  const selectedAnswer = timedOut || answer === "" ? null : answer;
  const isCorrect = selectedAnswer !== null && selectedAnswer === question.correctAnswer;
  session.answers.push({
    question: question.question,
    category: question.category,
    difficulty: question.difficulty,
    answers: question.answers,
    selectedAnswer,
    correctAnswer: question.correctAnswer,
    isCorrect,
    timedOut: timedOut || answer === "",
  });
  if (isCorrect) session.score += 1;
  else session.mistakes += 1;

  session.currentIndex += 1;
  const finished = session.currentIndex >= session.questions.length || (session.gameMode === "survival" && session.mistakes >= 3) || overallTimedOut;
  const now = Date.now();
  if (finished) {
    session.finishedAt = new Date(now).toISOString();
    leaderboard.push({
      quizId: session.id,
      playerName: session.playerName,
      score: session.score,
      total: session.answers.length,
      accuracy: session.answers.length ? session.score / session.answers.length : 0,
      durationSeconds: Math.max(0, Math.round((now - Date.parse(session.startedAt)) / 1000)),
      finishedAt: session.finishedAt,
      category: session.categoryName ?? "Mixed",
      xp: calculateXp(session),
      ...(session.challengeDate ? { challengeDate: session.challengeDate } : {}),
    });
    leaderboard.sort((a, b) => b.accuracy - a.accuracy || b.score - a.score || a.durationSeconds - b.durationSeconds);
    leaderboard.splice(1000);
  } else {
    session.questionStartedAt = now;
  }
  await persist();

  res.json({
    isCorrect,
    timedOut: timedOut || answer === "",
    correctAnswer: question.correctAnswer,
    answeredIndex: session.currentIndex - 1,
    score: session.score,
    totalQuestions: session.questions.length,
    gameMode: session.gameMode,
    mistakes: session.mistakes,
    finished,
    nextQuestion: finished ? null : currentQuestion(session),
    ...(finished ? { result: {
      quizId: session.id,
      playerName: session.playerName,
      score: session.score,
      total: session.answers.length,
      xp: calculateXp(session),
      finishedAt: session.finishedAt,
    } } : {}),
  });
});

router.get("/quizzes/:id/results", (req, res) => {
  const session = getSession(req.params.id, res);
  if (!session) return;
  if (!session.finishedAt) {
    res.status(409).json({ error: "La partie n'est pas terminée." }); return;
  }
  res.json({
    quizId: session.id,
    playerName: session.playerName,
    score: session.score,
    total: session.answers.length,
    finishedAt: session.finishedAt,
    durationSeconds: Math.max(0, Math.round((Date.parse(session.finishedAt) - Date.parse(session.startedAt)) / 1000)),
  });
});

router.get("/quizzes/:id/review", (req, res) => {
  const session = getSession(req.params.id, res);
  if (!session) return;
  if (!session.finishedAt) {
    res.status(409).json({ error: "La correction sera disponible à la fin de la partie." }); return;
  }
  res.json({ quizId: session.id, score: session.score, total: session.answers.length, answers: session.answers });
});

router.get("/leaderboard", (req, res) => {
  const scope = typeof req.query.scope === "string" ? req.query.scope : "global";
  const category = typeof req.query.category === "string" ? req.query.category.toLowerCase() : "";
  const names = typeof req.query.players === "string" ? req.query.players.split(",").map((name) => name.trim().toLowerCase()).filter(Boolean) : [];
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let entries = [...leaderboard];
  if (scope === "week") entries = entries.filter((entry) => Date.parse(entry.finishedAt) >= weekStart);
  if (scope === "category" && category) entries = entries.filter((entry) => (entry.category ?? "").toLowerCase().includes(category));
  if (scope === "friends" && names.length) entries = entries.filter((entry) => names.includes(entry.playerName.toLowerCase()));
  entries.sort((a, b) => b.accuracy - a.accuracy || b.score - a.score || a.durationSeconds - b.durationSeconds);
  res.json({ scope, leaderboard: entries.slice(0, 100).map((entry, index) => ({ rank: index + 1, ...entry })) });
});

router.get("/stats", (req, res) => {
  const name = typeof req.query.playerName === "string" ? req.query.playerName.trim().toLowerCase() : "";
  if (!name) { res.status(400).json({ error: "playerName est requis." }); return; }
  const records = leaderboard.filter((entry) => entry.playerName.toLowerCase() === name);
  const totalQuestions = records.reduce((sum, entry) => sum + entry.total, 0);
  const correctAnswers = records.reduce((sum, entry) => sum + entry.score, 0);
  const categoryStats = new Map<string, { quizzes: number; correct: number; total: number }>();
  for (const entry of records) {
    const key = entry.category ?? "Mixed";
    const current = categoryStats.get(key) ?? { quizzes: 0, correct: 0, total: 0 };
    current.quizzes += 1; current.correct += entry.score; current.total += entry.total;
    categoryStats.set(key, current);
  }
  res.json({
    playerName: name, quizzes: records.length, correctAnswers, totalQuestions,
    accuracy: totalQuestions ? Math.round(correctAnswers / totalQuestions * 100) : 0,
    averageDurationSeconds: records.length ? Math.round(records.reduce((sum, entry) => sum + entry.durationSeconds, 0) / records.length) : 0,
    categories: [...categoryStats.entries()].map(([category, value]) => ({ category, ...value, accuracy: value.total ? Math.round(value.correct / value.total * 100) : 0 })).sort((a, b) => b.accuracy - a.accuracy),
    history: records.sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt)).slice(0, 50),
  });
});

router.get("/history", (req, res) => {
  const name = typeof req.query.playerName === "string" ? req.query.playerName.trim().toLowerCase() : "";
  if (!name) {
    res.status(400).json({ error: "playerName est requis." }); return;
  }
  const history = leaderboard
    .filter((entry) => entry.playerName.toLowerCase() === name)
    .sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt))
    .slice(0, 50);
  res.json({ history });
});

export default router;
