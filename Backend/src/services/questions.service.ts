import * as opentdb from "./opentdb.service";
import * as triviaapi from "./triviaapi.service";

const provider = process.env.QUESTION_PROVIDER === "triviaapi" ? triviaapi : opentdb;

export const getCategories: () => Promise<{ id: number; name: string }[]> = provider.getCategories;
export const getQuestions = provider.getQuestions;

export type { QuizQuestion, Difficulty, QuestionType } from "./opentdb.service";