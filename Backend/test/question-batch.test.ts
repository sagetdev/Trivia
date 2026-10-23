import assert from "node:assert/strict";
import test from "node:test";
import { requireDifficultyBatch, requireQuestionCount } from "../src/services/question-batch";
import { hasDeadlinePassed, shouldFinishQuiz } from "../src/services/quiz-rules";
import { InMemoryRateLimiter } from "../src/services/rate-limit";

test("returns an empty batch when zero questions are requested", () => {
  assert.deepEqual(requireQuestionCount(["a"], 0, "provider"), []);
});

test("returns exactly the requested number of questions", () => {
  assert.deepEqual(requireQuestionCount(["a", "b", "c"], 2, "provider"), ["a", "b"]);
});

test("throws when a provider returns fewer questions than requested", () => {
  assert.throws(
    () => requireQuestionCount(["a"], 2, "Open Trivia DB"),
    /Open Trivia DB n'a retourné que 1 question\(s\) sur 2 demandées/,
  );
});

test("rejects invalid requested counts", () => {
  assert.throws(() => requireQuestionCount([], -1, "provider"), RangeError);
  assert.throws(() => requireQuestionCount([], 1.5, "provider"), RangeError);
});

test("rejects provider fallback questions at the wrong progressive difficulty", () => {
  assert.deepEqual(
    requireDifficultyBatch([{ difficulty: "easy" }, { difficulty: "easy" }], "easy", "Progressif"),
    [{ difficulty: "easy" }, { difficulty: "easy" }],
  );
  assert.throws(
    () => requireDifficultyBatch([{ difficulty: "medium" }], "easy", "Progressif"),
    /attend des questions "easy"/,
  );
});

test("treats the deadline as reached at the exact boundary", () => {
  assert.equal(hasDeadlinePassed(1000, 999), false);
  assert.equal(hasDeadlinePassed(1000, 1000), true);
  assert.equal(hasDeadlinePassed(null, 5000), false);
});

test("finishes survival mode after three mistakes", () => {
  assert.equal(shouldFinishQuiz({
    currentIndex: 4,
    totalQuestions: 10,
    gameMode: "survival",
    mistakes: 3,
    overallTimedOut: false,
  }), true);
  assert.equal(shouldFinishQuiz({
    currentIndex: 4,
    totalQuestions: 10,
    gameMode: "survival",
    mistakes: 2,
    overallTimedOut: false,
  }), false);
});

test("finishes a quiz at the question limit or global deadline", () => {
  assert.equal(shouldFinishQuiz({
    currentIndex: 10,
    totalQuestions: 10,
    gameMode: "classic",
    mistakes: 0,
    overallTimedOut: false,
  }), true);
  assert.equal(shouldFinishQuiz({
    currentIndex: 2,
    totalQuestions: 10,
    gameMode: "fast",
    mistakes: 0,
    overallTimedOut: true,
  }), true);
});

test("rate limiter allows only the configured count per window", () => {
  const limiter = new InMemoryRateLimiter();
  assert.deepEqual(limiter.consume("client-a", 2, 60_000, 1_000), {
    allowed: true,
    remaining: 1,
    retryAfterSeconds: 0,
  });
  assert.equal(limiter.consume("client-a", 2, 60_000, 2_000).allowed, true);
  assert.deepEqual(limiter.consume("client-a", 2, 60_000, 3_000), {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: 58,
  });
  assert.equal(limiter.consume("client-b", 2, 60_000, 3_000).allowed, true);
  assert.equal(limiter.consume("client-a", 2, 60_000, 61_000).allowed, true);
});
