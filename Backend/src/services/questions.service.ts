import * as opentdb from "./opentdb.service";
import * as triviaapi from "./triviaapi.service";
import type { Difficulty, QuestionType, QuizQuestion } from "./opentdb.service";

/**
 * OpenTDB remains the canonical category catalogue. Only categories with a
 * reasonably equivalent Trivia API category can use the 60/40 hybrid mix.
 * Set QUESTION_PROVIDER=opentdb to disable the hybrid mode.
 */
const openTdbOnly = process.env.QUESTION_PROVIDER === "opentdb";
export const providerName = openTdbOnly
  ? "Open Trivia DB"
  : "The Trivia API + Open Trivia DB";

const TRIVIA_CATEGORY_BY_OPEN_TDB_ID: Record<number, number> = {
  9: 101,  // General Knowledge
  11: 105, // Film
  12: 106, // Music
  14: 105, // Television
  17: 102, // Science & Nature
  21: 108, // Sports
  22: 104, // Geography
  23: 103, // History
};

export const getCategories: () => Promise<{ id: number; name: string }[]> =
  opentdb.getCategories;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getOpenTdbQuestionsStrict(
  amount: number,
  options: { categoryId?: number; difficulty?: Difficulty; type?: QuestionType },
  includeTrueFalse: boolean,
): Promise<QuizQuestion[]> {
  if (amount <= 0) return [];

  // Keep at least one multiple-choice OpenTDB question whenever possible.
  if (!includeTrueFalse || amount === 1) {
    return opentdb.getQuestions({ ...options, amount });
  }

  const trueFalseCount = randomInteger(1, Math.min(3, amount - 1));
  const multipleCount = amount - trueFalseCount;
  const [trueFalse, multiple] = await Promise.all([
    opentdb.getQuestions({ ...options, amount: trueFalseCount, type: "boolean" }),
    multipleCount > 0
      ? opentdb.getQuestions({ ...options, amount: multipleCount, type: "multiple" })
      : Promise.resolve([]),
  ]);
  return [...trueFalse, ...multiple];
}

/**
 * Retry progressively when a provider has too few questions for the exact
 * filters. Preserve category first, then relax difficulty, and only then
 * fall back to mixed categories as a last resort.
 */
async function getOpenTdbQuestions(
  amount: number,
  options: { categoryId?: number; difficulty?: Difficulty; type?: QuestionType },
  includeTrueFalse: boolean,
): Promise<QuizQuestion[]> {
  try {
    return await getOpenTdbQuestionsStrict(amount, options, includeTrueFalse);
  } catch (firstError) {
    if (options.difficulty) {
      try {
        return await getOpenTdbQuestionsStrict(
          amount,
          { ...options, difficulty: undefined },
          includeTrueFalse,
        );
      } catch {
        // Continue to the category fallback below.
      }
    }

    if (options.categoryId !== undefined) {
      try {
        return await getOpenTdbQuestionsStrict(
          amount,
          { ...options, categoryId: undefined, difficulty: undefined },
          includeTrueFalse,
        );
      } catch {
        // Keep the original error when every fallback fails.
      }
    }

    throw firstError;
  }
}

async function getTriviaQuestionsWithFallback(options: {
  amount: number;
  categoryId?: number;
  difficulty?: Difficulty;
}): Promise<QuizQuestion[]> {
  try {
    const questions = await triviaapi.getQuestions({
      ...options,
      type: "multiple",
    });
    if (questions.length >= options.amount) return questions.slice(0, options.amount);
    throw new Error("The Trivia API a retourné trop peu de questions.");
  } catch (firstError) {
    if (options.difficulty) {
      try {
        const questions = await triviaapi.getQuestions({
          ...options,
          difficulty: undefined,
          type: "multiple",
        });
        if (questions.length >= options.amount) return questions.slice(0, options.amount);
      } catch {
        // Try the final category fallback.
      }
    }

    if (options.categoryId !== undefined) {
      try {
        const questions = await triviaapi.getQuestions({
          amount: options.amount,
          difficulty: undefined,
          type: "multiple",
        });
        if (questions.length >= options.amount) return questions.slice(0, options.amount);
      } catch {
        // Preserve the first useful provider error.
      }
    }

    throw firstError;
  }
}

export async function getQuestions(options: {
  amount: number;
  categoryId?: number;
  difficulty?: Difficulty;
  type?: QuestionType;
}): Promise<QuizQuestion[]> {
  if (openTdbOnly || options.type === "boolean" || options.amount < 2) {
    return getOpenTdbQuestions(options.amount, options, options.type === undefined);
  }

  const triviaCategoryId = options.categoryId === undefined
    ? undefined
    : TRIVIA_CATEGORY_BY_OPEN_TDB_ID[options.categoryId];

  // If the selected OpenTDB category has no close equivalent in The Trivia
  // API, use OpenTDB alone rather than silently mixing unrelated subjects.
  if (options.categoryId !== undefined && triviaCategoryId === undefined) {
    return getOpenTdbQuestions(options.amount, options, options.type === undefined);
  }

  const triviaCount = Math.min(options.amount - 1, Math.max(1, Math.round(options.amount * 0.6)));
  const openTdbCount = options.amount - triviaCount;
  const categoryName = options.categoryId === undefined
    ? undefined
    : (await opentdb.getCategories()).find((category) => category.id === options.categoryId)?.name;

  const [triviaResult, openTdbResult] = await Promise.allSettled([
    getTriviaQuestionsWithFallback({
      amount: triviaCount,
      categoryId: triviaCategoryId,
      difficulty: options.difficulty,
    }),
    getOpenTdbQuestions(openTdbCount, options, options.type === undefined),
  ]);

  if (triviaResult.status === "rejected" && openTdbResult.status === "rejected") {
    throw new Error("Les deux API de questions sont temporairement indisponibles. Réessaie.");
  }

  if (triviaResult.status === "rejected") {
    // API de secours : remplir le quiz avec OpenTDB si The Trivia API échoue.
    return shuffle(await getOpenTdbQuestions(options.amount, options, options.type === undefined));
  }

  if (openTdbResult.status === "rejected") {
    // The Trivia API ne fournit pas de vrai/faux, mais peut compléter le quiz.
    const fallback = await getTriviaQuestionsWithFallback({
      amount: options.amount,
      categoryId: triviaCategoryId,
      difficulty: options.difficulty,
    });
    return shuffle(fallback.map((question) => ({
      ...question,
      ...(categoryName ? { category: categoryName } : {}),
    })));
  }

  const normalizedTrivia = triviaResult.value.map((question) => ({
    ...question,
    ...(categoryName ? { category: categoryName } : {}),
    source: "The Trivia API",
  }));
  return shuffle([...normalizedTrivia, ...openTdbResult.value]);
}

export type { QuizQuestion, Difficulty, QuestionType } from "./opentdb.service";
