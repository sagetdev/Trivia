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
  const currentLevelXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const xpIntoLevel = stats.xp - currentLevelXp;
  const levelProgress = Math.min(1, Math.max(0, xpIntoLevel / (nextLevelXp - currentLevelXp)));
  return {
    name, firstName: name.split(" ")[0], initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "P",
    handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
    level, xp: stats.xp, currentLevelXp, nextLevelXp, xpIntoLevel, levelProgress, streak: (() => { const today = new Date(); const todayKey = today.toISOString().slice(0, 10); const yesterday = new Date(today.getTime() - 86400000).toISOString().slice(0, 10); const lastDay = stats.activeDays[stats.activeDays.length - 1]; if (lastDay !== todayKey && lastDay !== yesterday) return 0; let streak = 1; for (let i = stats.activeDays.length - 1; i > 0; i--) { const current = new Date(stats.activeDays[i] + "T12:00:00.000Z").getTime(); const previous = new Date(stats.activeDays[i - 1] + "T12:00:00.000Z").getTime(); if (Math.round((current - previous) / 86400000) !== 1) break; streak++; } return streak; })(),
    bestStreak: stats.bestStreak, quizzes: stats.quizzes, accuracy, stats, loading, refresh,
  };
}
