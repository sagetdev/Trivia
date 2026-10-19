import { useCallback, useEffect, useState } from "react";
import { api, type QuizCategory } from "../lib/api";
import type { CategoryColor } from "../theme";
import type { IconName } from "../components/ui/Icon";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Category { id: string; name: string; icon: IconName; color: CategoryColor }
export const MIXED: Category = { id: "any", name: "Mixed", icon: "target", color: "purple" };
const palette: CategoryColor[] = ["blue", "orange", "green", "pink", "purple", "teal"];
const iconById: Record<number, IconName> = {
  9: "brain", 10: "book", 11: "film", 12: "music", 13: "theater", 14: "tv", 15: "gamepad",
  16: "dice", 17: "leaf", 18: "cpu", 19: "calculator", 20: "scroll", 21: "activity",
  22: "globe", 23: "landmark", 24: "vote", 25: "palette", 26: "star", 27: "paw",
  28: "car", 29: "sparkles", 30: "phone", 31: "swords", 32: "smile",
  101: "brain", 102: "flask", 103: "landmark", 104: "globe", 105: "film", 106: "music",
  107: "book", 108: "activity", 109: "theater", 110: "sparkles",
};
export const shortName = (name: string) => name.replace(/^(Entertainment|Science): /, "");
const toCategory = (c: QuizCategory): Category => ({
  id: String(c.id), name: shortName(c.name), icon: iconById[c.id] ?? "help", color: palette[c.id % palette.length],
});
const TTL = 24 * 60 * 60 * 1000;
let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

async function readCache(provider: string): Promise<Category[] | null> {
  try {
    const key = `categories:v4:${process.env.EXPO_PUBLIC_API_URL ?? "local"}:${provider}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { savedAt: number; data: Category[] };
    return Array.isArray(saved.data) && saved.data.length > 0 && Date.now() - saved.savedAt < TTL ? saved.data : null;
  } catch { return null; }
}

async function fetchAndStore(provider: string): Promise<Category[]> {
  const response = await api.getCategories();
  const list = response.categories.map(toCategory);
  const key = `categories:v4:${process.env.EXPO_PUBLIC_API_URL ?? "local"}:${response.provider || provider}`;
  cache = list;
  AsyncStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data: list })).catch(() => {});
  return list;
}

export function loadCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= (async () => {
    const config = await api.getConfig();
    const saved = await readCache(config.provider);
    if (saved) { cache = saved; return saved; }
    return fetchAndStore(config.provider);
  })().finally(() => { inflight = null; });
  return inflight;
}
export const findCategory = (id?: string): Category => cache?.find((category) => category.id === id) ?? MIXED;
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    setLoading(true); setError(null);
    loadCategories().then(setCategories).catch((e) => setError(e instanceof Error ? e.message : "Erreur inconnue")).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (!cache) load(); }, [load]);
  return { categories, loading, error, reload: load };
}
