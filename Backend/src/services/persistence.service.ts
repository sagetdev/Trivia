import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export interface PersistentState {
  sessions: Array<[string, unknown]>;
  leaderboard: unknown[];
  records: unknown[];
  dailyQuestions?: Array<[string, unknown]>;
}

const dataFile = resolve(process.env.QUIZ_DATA_FILE ?? "./data/quiz-store.json");

export async function readPersistentState(): Promise<PersistentState> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistentState>;
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions as Array<[string, unknown]> : [],
      leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : [],
      records: Array.isArray(parsed.records) ? parsed.records : [],
      dailyQuestions: Array.isArray(parsed.dailyQuestions) ? parsed.dailyQuestions as Array<[string, unknown]> : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { sessions: [], leaderboard: [], records: [], dailyQuestions: [] };
    }
    throw error;
  }
}

export async function writePersistentState(state: PersistentState): Promise<void> {
  await mkdir(dirname(dataFile), { recursive: true });
  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, JSON.stringify(state), "utf8");
  await rename(tempFile, dataFile);
}
