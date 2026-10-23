import assert from "node:assert/strict";
import test from "node:test";
import { requireQuestionCount } from "../src/services/question-batch";

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
