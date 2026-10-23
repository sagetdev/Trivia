import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AnswerReview } from "./api";

const FAVORITES_KEY = "trivia:question-library:favorites:v1";
const HISTORY_KEY = "trivia:question-library:history:v1";
const INCORRECT_KEY = "trivia:question-library:incorrect:v1";
const MAX_ITEMS = 500;

export type SavedQuestion = AnswerReview;

export function questionKey(item: Pick<SavedQuestion, "question">): string {
  return item.question.trim().toLowerCase();
}

async function readList(key: string): Promise<SavedQuestion[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedQuestion =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as SavedQuestion).question === "string" &&
        Array.isArray((item as SavedQuestion).answers),
    ).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

async function writeList(key: string, items: SavedQuestion[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

function mergeNewest(items: SavedQuestion[], previous: SavedQuestion[]): SavedQuestion[] {
  const merged = new Map<string, SavedQuestion>();
  for (const item of [...items, ...previous]) {
    const key = questionKey(item);
    if (key && !merged.has(key)) merged.set(key, item);
  }
  return [...merged.values()].slice(0, MAX_ITEMS);
}

export async function getQuestionLibrary(): Promise<{
  favorites: SavedQuestion[];
  history: SavedQuestion[];
  incorrect: SavedQuestion[];
}> {
  const [favorites, history, incorrect] = await Promise.all([
    readList(FAVORITES_KEY),
    readList(HISTORY_KEY),
    readList(INCORRECT_KEY),
  ]);
  return { favorites, history, incorrect };
}

/** Records reviewed questions locally without counting them as a new quiz or XP. */
export async function recordQuestionReview(answers: SavedQuestion[]): Promise<void> {
  if (answers.length === 0) return;
  const [history, incorrect] = await Promise.all([
    readList(HISTORY_KEY),
    readList(INCORRECT_KEY),
  ]);
  await Promise.all([
    writeList(HISTORY_KEY, mergeNewest([...answers].reverse(), history)),
    writeList(INCORRECT_KEY, mergeNewest(answers.filter((item) => !item.isCorrect), incorrect)),
  ]);
}

/** Returns true when the question is now a favorite, false when it was removed. */
export async function toggleQuestionFavorite(item: SavedQuestion): Promise<boolean> {
  const favorites = await readList(FAVORITES_KEY);
  const key = questionKey(item);
  if (favorites.some((favorite) => questionKey(favorite) === key)) {
    await writeList(FAVORITES_KEY, favorites.filter((favorite) => questionKey(favorite) !== key));
    return false;
  }
  await writeList(FAVORITES_KEY, mergeNewest([item], favorites));
  return true;
}

export async function removeQuestionFromList(
  list: "favorites" | "incorrect",
  item: SavedQuestion,
): Promise<void> {
  const key = questionKey(item);
  const storageKey = list === "favorites" ? FAVORITES_KEY : INCORRECT_KEY;
  const items = await readList(storageKey);
  await writeList(storageKey, items.filter((entry) => questionKey(entry) !== key));
}
