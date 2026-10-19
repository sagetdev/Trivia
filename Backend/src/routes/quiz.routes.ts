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

const router = Router();

interface QuizSession {
  id: string;
  playerName: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answeredCurrent: boolean;
  finishedAt?: string;
}

interface LeaderboardEntry {
  quizId: string;
  playerName: string;
  score: number;
  total: number;
  finishedAt: string;
}

const sessions = new Map<string, QuizSession>();
const leaderboard: LeaderboardEntry[] = [];

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

router.get("/categories", async (_req, res) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : "Erreur OpenTDB.",
    });
  }
});

router.post("/quizzes", async (req, res) => {
  const body = req.body as Record<string, unknown>;

  const amount = body.amount ?? 10;
  const categoryId = body.categoryId;
  const difficulty = body.difficulty;
  const type = body.type;
  const playerName = body.playerName ?? "Joueur";

  if (
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    amount < 1 ||
    amount > 20
  ) {
    res.status(400).json({ error: "amount doit être entre 1 et 20." });
    return;
  }

  if (
    categoryId !== undefined &&
    (typeof categoryId !== "number" ||
      !Number.isInteger(categoryId) ||
      categoryId < 1)
  ) {
    res.status(400).json({ error: "categoryId invalide." });
    return;
  }

  if (
    difficulty !== undefined &&
    !["easy", "medium", "hard"].includes(String(difficulty))
  ) {
    res.status(400).json({ error: "difficulty invalide." });
    return;
  }

  if (
    type !== undefined &&
    !["multiple", "boolean"].includes(String(type))
  ) {
    res.status(400).json({ error: "type invalide." });
    return;
  }

  if (
    typeof playerName !== "string" ||
    playerName.trim().length < 1 ||
    playerName.trim().length > 30
  ) {
    res.status(400).json({ error: "playerName doit contenir 1 à 30 caractères." });
    return;
  }

  try {
    const questions = await getQuestions({
      amount,
      categoryId: categoryId as number | undefined,
      difficulty: difficulty as Difficulty | undefined,
      type: type as QuestionType | undefined,
    });

    const id = randomUUID();

    const session: QuizSession = {
      id,
      playerName: playerName.trim(),
      questions,
      currentIndex: 0,
      score: 0,
      answeredCurrent: false,
    };

    sessions.set(id, session);

    res.status(201).json({
      quizId: id,
      totalQuestions: questions.length,
      question: publicQuestion(questions[0]),
    });
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : "Impossible de créer la partie.",
    });
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
  });
});

router.post("/quizzes/:id/answers", (req, res) => {
  const session = getSession(req.params.id, res);
  if (!session) return;

  if (session.finishedAt) {
    res.status(409).json({ error: "Cette partie est terminée." });
    return;
  }

  if (session.answeredCurrent) {
    res.status(409).json({ error: "Tu as déjà répondu à cette question." });
    return;
  }

  const answer = req.body?.answer;

  if (typeof answer !== "string") {
    res.status(400).json({ error: "answer doit être une chaîne de caractères." });
    return;
  }

  const question = session.questions[session.currentIndex];

  if (!question) {
    res.status(409).json({ error: "Aucune question disponible." });
    return;
  }

  const isCorrect = answer === question.correctAnswer;

  session.answeredCurrent = true;

  if (isCorrect) {
    session.score += 1;
  }

  const answeredIndex = session.currentIndex;

  // La bonne réponse n'est révélée qu'après la soumission.
  session.currentIndex += 1;
  session.answeredCurrent = false;

  const finished = session.currentIndex >= session.questions.length;

  if (finished) {
    session.finishedAt = new Date().toISOString();

    leaderboard.push({
      quizId: session.id,
      playerName: session.playerName,
      score: session.score,
      total: session.questions.length,
      finishedAt: session.finishedAt,
    });

    leaderboard.sort(
      (a, b) => b.score / b.total - a.score / a.total || b.score - a.score,
    );

    leaderboard.splice(100);
  }

  res.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    answeredIndex,
    score: session.score,
    totalQuestions: session.questions.length,
    finished,
    nextQuestion: finished ? null : currentQuestion(session),
    ...(finished
      ? {
          result: {
            quizId: session.id,
            playerName: session.playerName,
            score: session.score,
            total: session.questions.length,
            finishedAt: session.finishedAt,
          },
        }
      : {}),
  });
});

router.get("/quizzes/:id/results", (req, res) => {
  const session = getSession(req.params.id, res);
  if (!session) return;

  if (!session.finishedAt) {
    res.status(409).json({ error: "La partie n'est pas terminée." });
    return;
  }

  res.json({
    quizId: session.id,
    playerName: session.playerName,
    score: session.score,
    total: session.questions.length,
    finishedAt: session.finishedAt,
  });
});

router.get("/leaderboard", (_req, res) => {
  res.json({
    leaderboard: leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    })),
  });
});

export default router;