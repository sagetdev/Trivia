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
}

interface QuizSession {
  id: string;
  playerName: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  startedAt: string;
  questionStartedAt: number;
  timePerQuestion: number | null;
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
}

const sessions = new Map<string, QuizSession>();
const leaderboard: LeaderboardEntry[] = [];
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
  const amount = body.amount ?? 10;
  const categoryId = body.categoryId;
  const difficulty = body.difficulty;
  const type = body.type;
  const playerName = body.playerName ?? "Joueur";
  const timePerQuestion = body.timePerQuestion === null || body.timePerQuestion === undefined
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
  if (timePerQuestion !== null && (typeof timePerQuestion !== "number" || ![15, 30, 45].includes(timePerQuestion))) {
    res.status(400).json({ error: "timePerQuestion doit être 15, 30, 45 ou null." }); return;
  }
  if (typeof playerName !== "string" || playerName.trim().length < 1 || playerName.trim().length > 30) {
    res.status(400).json({ error: "playerName doit contenir 1 à 30 caractères." }); return;
  }

  try {
    const questions = await getQuestions({
      amount,
      categoryId: categoryId as number | undefined,
      difficulty: difficulty as Difficulty | undefined,
      type: type as QuestionType | undefined,
    });
    if (!questions.length) {
      res.status(502).json({ error: "Le fournisseur n'a retourné aucune question." }); return;
    }
    const id = randomUUID();
    const now = Date.now();
    const session: QuizSession = {
      id,
      playerName: playerName.trim(),
      questions,
      currentIndex: 0,
      score: 0,
      startedAt: new Date(now).toISOString(),
      questionStartedAt: now,
      timePerQuestion: timePerQuestion as number | null,
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

  const timedOut = session.timePerQuestion !== null &&
    Date.now() - session.questionStartedAt > session.timePerQuestion * 1000;
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

  session.currentIndex += 1;
  const finished = session.currentIndex >= session.questions.length;
  const now = Date.now();
  if (finished) {
    session.finishedAt = new Date(now).toISOString();
    const total = session.questions.length;
    leaderboard.push({
      quizId: session.id,
      playerName: session.playerName,
      score: session.score,
      total,
      accuracy: session.score / total,
      durationSeconds: Math.max(0, Math.round((now - Date.parse(session.startedAt)) / 1000)),
      finishedAt: session.finishedAt,
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
    finished,
    nextQuestion: finished ? null : currentQuestion(session),
    ...(finished ? { result: {
      quizId: session.id,
      playerName: session.playerName,
      score: session.score,
      total: session.questions.length,
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
    total: session.questions.length,
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
  res.json({ quizId: session.id, score: session.score, total: session.questions.length, answers: session.answers });
});

router.get("/leaderboard", (_req, res) => {
  res.json({ leaderboard: leaderboard.slice(0, 100).map((entry, index) => ({ rank: index + 1, ...entry })) });
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
