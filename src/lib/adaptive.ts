/**
 * Adaptive mastery engine: updates a student's SkillMastery score after each
 * attempt, similar in spirit to an Elo/IRT-lite update. Score is 0-100.
 */

export const MASTERY_THRESHOLD = 80;

export function updateMastery(currentScore: number, correct: boolean, difficulty: number): number {
  // Harder questions move the needle more.
  const weight = 4 + difficulty * 2; // difficulty 1..5 => weight 6..14
  const delta = correct ? weight : -weight * 0.8;
  const next = currentScore + delta;
  return Math.max(0, Math.min(100, Math.round(next)));
}

export function statusForScore(score: number): "ready" | "in-progress" | "mastered" {
  if (score >= MASTERY_THRESHOLD) return "mastered";
  if (score > 0) return "in-progress";
  return "ready";
}

/**
 * Diagnostic quiz stepper: given the last difficulty and whether the answer
 * was correct, pick the next difficulty (1-5), binary-search style.
 */
export function nextDiagnosticDifficulty(lastDifficulty: number, correct: boolean): number {
  const step = correct ? 1 : -1;
  return Math.max(1, Math.min(5, lastDifficulty + step));
}

/** Convert a short run of diagnostic results into a starting mastery score. */
export function scoreFromDiagnostic(results: { difficulty: number; correct: boolean }[]): number {
  if (results.length === 0) return 0;
  let score = 0;
  for (const r of results) {
    score += r.correct ? r.difficulty * 6 : -r.difficulty * 2;
  }
  return Math.max(0, Math.min(70, Math.round(score / results.length) * 3)); // cap diagnostic-derived score below mastery
}
