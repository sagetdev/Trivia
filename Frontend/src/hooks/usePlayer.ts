import { useCallback, useEffect, useState } from "react";
import { getPlayerName, getPlayerStats, type PlayerStats } from "../lib/player";

export function usePlayer() {
  const [name, setName] = useState("Player");
  const [stats, setStats] = useState<PlayerStats>({ records: [], xp: 0, quizzes: 0, correct: 0, total: 0, bestStreak: 0, activeDays: [] });
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    const [nextName, nextStats] = await Promise.all([getPlayerName(), getPlayerStats()]);
    setName(nextName);
    setStats(nextStats);
    setLoading(false);
  }, []);
  useEffect(() => { refresh().catch(() => setLoading(false)); }, [refresh]);
  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  const level = Math.floor(stats.xp / 100) + 1;
  const nextLevelXp = level * 100;
  return {
    name, firstName: name.split(" ")[0], initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "P",
    handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
    level, xp: stats.xp, nextLevelXp, streak: stats.activeDays.includes(new Date().toISOString().slice(0, 10)) ? 1 : 0,
    bestStreak: stats.bestStreak, quizzes: stats.quizzes, accuracy, stats, loading, refresh,
  };
}
