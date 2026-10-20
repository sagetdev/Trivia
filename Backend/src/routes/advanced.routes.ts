import { Router } from "express";
import { randomUUID } from "node:crypto";
import { getQuestions, type Difficulty, type QuestionType, type QuizQuestion } from "../services/questions.service";

const router = Router();
type RoomPlayer = { id: string; name: string; score: number; answers: number; connectedAt: string };
type Room = {
  code: string; hostId: string; status: "waiting" | "playing" | "finished";
  createdAt: string; categoryId?: number; difficulty: Difficulty; amount: number;
  timePerQuestion: number | null; questions: QuizQuestion[]; currentIndex: number; questionStartedAt: number;
  players: RoomPlayer[]; answerKeys: Record<string, { answer: string; at: number }>;
};
function advanceTimedOutRoom(room: Room): void {
  if (room.status !== "playing" || room.timePerQuestion === null) return;
  if (Date.now() - room.questionStartedAt < room.timePerQuestion * 1000) return;
  for (const player of room.players) {
    const key = `${room.currentIndex}:${player.id}`;
    if (!room.answerKeys[key]) room.answerKeys[key] = { answer: "", at: Date.now() };
  }
  room.currentIndex += 1;
  if (room.currentIndex >= room.questions.length) room.status = "finished";
  else room.questionStartedAt = Date.now();
}
const rooms = new Map<string, Room>();
const roomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const safeRoom = (room: Room, playerId?: string) => ({
  code: room.code, status: room.status, createdAt: room.createdAt, difficulty: room.difficulty,
  amount: room.amount, currentIndex: room.currentIndex, totalQuestions: room.questions.length,
  players: room.players.map(({ id, name, score, answers }) => ({ id, name, score, answers, isYou: id === playerId })),
  question: room.status === "playing" && playerId
    ? (() => { const q = room.questions[room.currentIndex]; return q ? { category: q.category, difficulty: q.difficulty, type: q.type, question: q.question, answers: q.answers } : null; })()
    : null,
});
function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 1 && name.length <= 24 ? name : null;
}
function findRoom(code: string) { return rooms.get(code.toUpperCase()); }

router.post("/rooms", async (req, res) => {
  const name = cleanName(req.body?.playerName);
  const amount = req.body?.amount ?? 10;
  const difficulty = req.body?.difficulty ?? "medium";
  const categoryId = req.body?.categoryId;
  const time = req.body?.timePerQuestion === undefined ? 30 : req.body.timePerQuestion;
  if (!name) { res.status(400).json({ error: "Pseudo invalide (1 à 24 caractères)." }); return; }
  if (!Number.isInteger(amount) || amount < 1 || amount > 20) { res.status(400).json({ error: "amount doit être entre 1 et 20." }); return; }
  if (!["easy", "medium", "hard"].includes(difficulty)) { res.status(400).json({ error: "Difficulté invalide." }); return; }
  if (categoryId !== undefined && (!Number.isInteger(categoryId) || categoryId < 1)) { res.status(400).json({ error: "Catégorie invalide." }); return; }
  if (time !== null && ![15, 30, 45].includes(time)) { res.status(400).json({ error: "Temps invalide." }); return; }
  try {
    const questions = await getQuestions({ amount, categoryId, difficulty: difficulty as Difficulty, type: "multiple" as QuestionType });
    if (!questions.length) { res.status(502).json({ error: "Aucune question disponible." }); return; }
    let code = roomCode();
    while (rooms.has(code)) code = roomCode();
    const playerId = randomUUID();
    const room: Room = {
      code, hostId: playerId, status: "waiting", createdAt: new Date().toISOString(),
      categoryId, difficulty: difficulty as Difficulty, amount, timePerQuestion: time,
      questions, currentIndex: 0, questionStartedAt: 0, players: [{ id: playerId, name, score: 0, answers: 0, connectedAt: new Date().toISOString() }],
      answerKeys: {},
    };
    rooms.set(code, room);
    res.status(201).json({ ...safeRoom(room, playerId), playerId });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Impossible de créer la salle." });
  }
});

router.post("/rooms/:code/join", (req, res) => {
  const room = findRoom(req.params.code);
  const name = cleanName(req.body?.playerName);
  if (!room) { res.status(404).json({ error: "Salle introuvable." }); return; }
  if (!name) { res.status(400).json({ error: "Pseudo invalide (1 à 24 caractères)." }); return; }
  if (room.status !== "waiting") { res.status(409).json({ error: "Cette partie a déjà commencé." }); return; }
  if (room.players.length >= 8) { res.status(409).json({ error: "La salle est complète (8 joueurs maximum)." }); return; }
  const playerId = randomUUID();
  room.players.push({ id: playerId, name, score: 0, answers: 0, connectedAt: new Date().toISOString() });
  res.status(201).json({ ...safeRoom(room, playerId), playerId });
});

router.post("/rooms/:code/start", (req, res) => {
  const room = findRoom(req.params.code);
  if (!room) { res.status(404).json({ error: "Salle introuvable." }); return; }
  if (req.body?.playerId !== room.hostId) { res.status(403).json({ error: "Seul l'hôte peut lancer la partie." }); return; }
  if (room.status !== "waiting") { res.status(409).json({ error: "La partie a déjà commencé." }); return; }
  if (room.players.length < 2) { res.status(409).json({ error: "Il faut au moins deux joueurs pour commencer." }); return; }
  room.status = "playing";
  room.questionStartedAt = Date.now();
  res.json(safeRoom(room, room.hostId));
});

router.get("/rooms/:code", (req, res) => {
  const room = findRoom(req.params.code);
  if (!room) { res.status(404).json({ error: "Salle introuvable." }); return; }
  advanceTimedOutRoom(room);
  const playerId = typeof req.query.playerId === "string" ? req.query.playerId : undefined;
  if (playerId && !room.players.some((p) => p.id === playerId)) { res.status(403).json({ error: "Joueur inconnu dans cette salle." }); return; }
  res.json(safeRoom(room, playerId));
});

router.post("/rooms/:code/answers", (req, res) => {
  const room = findRoom(req.params.code);
  if (!room) { res.status(404).json({ error: "Salle introuvable." }); return; }
  advanceTimedOutRoom(room);
  if (room.status !== "playing") { res.status(409).json({ error: "La partie n'est pas en cours." }); return; }
  const { playerId, answer, questionIndex } = req.body ?? {};
  const player = room.players.find((p) => p.id === playerId);
  if (!player) { res.status(403).json({ error: "Joueur inconnu dans cette salle." }); return; }
  if (questionIndex !== room.currentIndex) { res.status(409).json({ error: "La question a changé. Synchronise la salle." }); return; }
  const question = room.questions[room.currentIndex];
  if (!question || typeof answer !== "string" || !question.answers.includes(answer)) {
    res.status(400).json({ error: "Réponse invalide." }); return;
  }
  const key = `${room.currentIndex}:${playerId}`;
  if (room.answerKeys[key]) { res.status(409).json({ error: "Réponse déjà envoyée." }); return; }
  room.answerKeys[key] = { answer, at: Date.now() };
  player.answers += 1;
  const correct = answer === question.correctAnswer;
  if (correct) player.score += 1;
  const allAnswered = room.players.every((p) => Boolean(room.answerKeys[`${room.currentIndex}:${p.id}`]));
  if (allAnswered) {
    room.currentIndex += 1;
    if (room.currentIndex >= room.questions.length) room.status = "finished";
    else room.questionStartedAt = Date.now();
  }
  res.json({ correct, correctAnswer: question.correctAnswer, allAnswered, room: safeRoom(room, playerId) });
});

router.get("/daily-challenge", (_req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  // The challenge identity is stable for the UTC day; question selection still comes from the configured provider.
  const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  res.json({ date, amount: 10, difficulty: ["easy", "medium", "hard"][seed % 3], timePerQuestion: 30, resetTimezone: "UTC" });
});

router.get("/rooms/:code/results", (req, res) => {
  const room = findRoom(req.params.code);
  if (!room) { res.status(404).json({ error: "Salle introuvable." }); return; }
  if (room.status !== "finished") { res.status(409).json({ error: "La partie n'est pas terminée." }); return; }
  res.json({ code: room.code, results: [...room.players].sort((a, b) => b.score - a.score || a.answers - b.answers).map((p, index) => ({ rank: index + 1, playerName: p.name, score: p.score, total: room.questions.length })) });
});

export default router;
