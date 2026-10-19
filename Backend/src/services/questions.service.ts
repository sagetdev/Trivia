import * as opentdb from "./opentdb.service";
import * as triviaapi from "./triviaapi.service";

const useTriviaApi = process.env.QUESTION_PROVIDER === "triviaapi";
const provider = useTriviaApi ? triviaapi : opentdb;

export const providerName = useTriviaApi ? "The Trivia API" : "Open Trivia DB";

export const getCategories: () => Promise<{ id: number; name: string }[]> = provider.getCategories;
export const getQuestions = provider.getQuestions;

export type { QuizQuestion, Difficulty, QuestionType } from "./opentdb.service";