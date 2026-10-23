/**
 * Enforce the amount requested by the quiz setup.
 *
 * Providers can respond successfully with fewer questions than requested when
 * their catalogue is exhausted. Treat that as a provider failure so callers can
 * try their documented fallback instead of silently starting a shorter quiz.
 */
export function requireQuestionCount<T>(
  questions: readonly T[],
  requested: number,
  provider: string,
): T[] {
  if (!Number.isInteger(requested) || requested < 0) {
    throw new RangeError("Le nombre de questions demandé doit être un entier positif.");
  }
  if (requested === 0) return [];
  if (questions.length < requested) {
    throw new Error(
      `${provider} n'a retourné que ${questions.length} question(s) sur ${requested} demandées.`,
    );
  }
  return questions.slice(0, requested);
}
