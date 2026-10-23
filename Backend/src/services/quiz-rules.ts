export type QuizGameMode = "classic" | "fast" | "survival" | "progressive";

export function hasDeadlinePassed(deadlineAt: number | null, now = Date.now()): boolean {
  return deadlineAt !== null && now >= deadlineAt;
}

export function shouldFinishQuiz(state: {
  currentIndex: number;
  totalQuestions: number;
  gameMode: QuizGameMode;
  mistakes: number;
  overallTimedOut: boolean;
}): boolean {
  return state.currentIndex >= state.totalQuestions ||
    (state.gameMode === "survival" && state.mistakes >= 3) ||
    state.overallTimedOut;
}
