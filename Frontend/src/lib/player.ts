import AsyncStorage from "@react-native-async-storage/async-storage";

const NAME_KEY = "trivia:player-name:v1";
const STATS_KEY = "trivia:player-stats:v1";

export interface QuizRecord {
  quizId: string;
  score: number;
  total: number;
  xp: number;
  durationSeconds: number;
  finishedAt: string;
}
export interface PlayerStats {
  records: QuizRecord[];
  xp: number;
  quizzes: number;
  correct: number;
  total: number;
  bestStreak: number;
  activeDays: string[];
}
const emptyStats: PlayerStats = { records: [], xp: 0, quizzes: 0, correct: 0, total: 0, bestStreak: 0, activeDays: [] };

export async function getPlayerName(): Promise<string> {
  const value = (await AsyncStorage.getItem(NAME_KEY))?.trim();
  return value || "Player";
}
export async function setPlayerName(value: string): Promise<void> {
  const name = value.trim().replace(/\s+/g, " ").slice(0, 24);
  if (!name) throw new Error("Le pseudo ne peut pas être vide.");
  await AsyncStorage.setItem(NAME_KEY, name);
}
export async function getPlayerStats(): Promise<PlayerStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return emptyStats;
    const saved = JSON.parse(raw) as PlayerStats;
    if (!Array.isArray(saved.records)) return emptyStats;
    const records = saved.records;
    const activeDays = [...new Set(records.map((r) => r.finishedAt.slice(0, 10)))].sort();
    let bestStreak = 0;
    let currentStreak = 0;
    let previous: Date | null = null;
    for (const day of activeDays) {
      const date = new Date(`${day}T12:00:00.000Z`);
      const gap = previous ? Math.round((date.getTime() - previous.getTime()) / 86400000) : 0;
      currentStreak = gap === 1 ? currentStreak + 1 : 1;
      bestStreak = Math.max(bestStreak, currentStreak);
      previous = date;
    }
    return {
      records,
      xp: records.reduce((sum, r) => sum + r.xp, 0),
      quizzes: records.length,
      correct: records.reduce((sum, r) => sum + r.score, 0),
      total: records.reduce((sum, r) => sum + r.total, 0),
      bestStreak,
      activeDays,
    };
  } catch {
    return emptyStats;
  }
}
export async function recordCompletedQuiz(record: QuizRecord): Promise<void> {
  const stats = await getPlayerStats();
  if (stats.records.some((item) => item.quizId === record.quizId)) return;
  const records = [record, ...stats.records].slice(0, 500);
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify({ records }));
}
