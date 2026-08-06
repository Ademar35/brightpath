import { prisma } from "./db";
import { nextDiagnosticDifficulty, updateMastery, statusForScore } from "./adaptive";
import { rebuildLearningPath, ensureMasteryRow, Subject } from "./learningPath";

const DIAGNOSTIC_LENGTH = 10;

export interface QuestionOut {
  id: string;
  prompt: string;
  choices: string[];
  difficulty: number;
  skillId: string;
  skillName: string;
}

function toOut(q: { id: string; prompt: string; choices: string; difficulty: number; skillId: string }, skillName: string): QuestionOut {
  return {
    id: q.id,
    prompt: q.prompt,
    choices: JSON.parse(q.choices),
    difficulty: q.difficulty,
    skillId: q.skillId,
    skillName,
  };
}

/** Get or start diagnostic state; returns the next question for the student in this subject. */
export async function getNextQuestion(studentId: string, subject: Subject): Promise<{ mode: "diagnostic" | "practice" | "done"; question?: QuestionOut; progress?: { current: number; total: number } }> {
  const diag = await prisma.diagnosticState.upsert({
    where: { studentId_subject: { studentId, subject } },
    update: {},
    create: { studentId, subject, completed: false },
  });

  if (!diag.completed) {
    const attemptsSoFar = await prisma.attempt.count({ where: { studentId, context: "diagnostic", question: { skill: { subject } } } });
    if (attemptsSoFar >= DIAGNOSTIC_LENGTH) {
      await finalizeDiagnostic(studentId, subject);
      return getNextQuestion(studentId, subject);
    }

    const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
    const lastAttempt = await prisma.attempt.findFirst({
      where: { studentId, context: "diagnostic", question: { skill: { subject } } },
      orderBy: { createdAt: "desc" },
      include: { question: true },
    });
    const difficulty = lastAttempt ? nextDiagnosticDifficulty(lastAttempt.question.difficulty, lastAttempt.correct) : 3;

    const skills = await prisma.skill.findMany({ where: { subject, grade: student.grade } });
    const skillIds = skills.length > 0 ? skills.map((s) => s.id) : (await prisma.skill.findMany({ where: { subject } })).map((s) => s.id);

    const recentQIds = (await prisma.attempt.findMany({ where: { studentId, context: "diagnostic" }, select: { questionId: true } })).map((a) => a.questionId);

    const candidates = await prisma.question.findMany({
      where: { skillId: { in: skillIds }, difficulty, id: { notIn: recentQIds } },
      take: 20,
    });
    const pool = candidates.length > 0
      ? candidates
      : await prisma.question.findMany({ where: { skillId: { in: skillIds }, id: { notIn: recentQIds } }, take: 20 });
    if (pool.length === 0) {
      await finalizeDiagnostic(studentId, subject);
      return getNextQuestion(studentId, subject);
    }
    const q = pool[Math.floor(Math.random() * pool.length)];
    const skill = skills.find((s) => s.id === q.skillId) ?? (await prisma.skill.findUniqueOrThrow({ where: { id: q.skillId } }));
    return { mode: "diagnostic", question: toOut(q, skill.name), progress: { current: attemptsSoFar + 1, total: DIAGNOSTIC_LENGTH } };
  }

  // Practice mode: pull from the current top of the learning path.
  let pathItem = await prisma.lessonPlanItem.findFirst({
    where: { studentId, subject, completedAt: null },
    orderBy: { order: "asc" },
    include: { skill: true },
  });

  if (!pathItem) {
    await rebuildLearningPath(studentId, subject);
    pathItem = await prisma.lessonPlanItem.findFirst({
      where: { studentId, subject, completedAt: null },
      orderBy: { order: "asc" },
      include: { skill: true },
    });
  }

  if (!pathItem) {
    return { mode: "done" };
  }

  const recentQIds = (
    await prisma.attempt.findMany({
      where: { studentId, question: { skillId: pathItem.skillId } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { questionId: true },
    })
  ).map((a) => a.questionId);

  const mastery = await ensureMasteryRow(studentId, pathItem.skillId);
  const targetDifficulty = Math.min(5, Math.max(1, Math.round(mastery.score / 20) + 1));

  let pool = await prisma.question.findMany({
    where: { skillId: pathItem.skillId, id: { notIn: recentQIds }, difficulty: { gte: Math.max(1, targetDifficulty - 1), lte: Math.min(5, targetDifficulty + 1) } },
  });
  if (pool.length === 0) pool = await prisma.question.findMany({ where: { skillId: pathItem.skillId } });

  const q = pool[Math.floor(Math.random() * pool.length)];
  return { mode: "practice", question: toOut(q, pathItem.skill.name) };
}

async function finalizeDiagnostic(studentId: string, subject: Subject) {
  const attempts = await prisma.attempt.findMany({
    where: { studentId, context: "diagnostic", question: { skill: { subject } } },
    include: { question: true },
  });

  const bySkill = new Map<string, { difficulty: number; correct: boolean }[]>();
  for (const a of attempts) {
    const arr = bySkill.get(a.question.skillId) ?? [];
    arr.push({ difficulty: a.question.difficulty, correct: a.correct });
    bySkill.set(a.question.skillId, arr);
  }

  // Derive an overall performance level, then seed ALL skills up to grade with a rough starting mastery
  // so the path builder has real signal, weighted down for skills with no direct diagnostic data.
  const totalCorrect = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length > 0 ? totalCorrect / attempts.length : 0.5;
  const baseScore = Math.round(accuracy * 55); // never diagnostic-only mastery to threshold

  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
  const skills = await prisma.skill.findMany({ where: { subject, grade: { lte: student.grade } } });

  for (const s of skills) {
    const direct = bySkill.get(s.id);
    const score = direct
      ? Math.round((direct.filter((d) => d.correct).length / direct.length) * 60)
      : Math.max(0, baseScore - 10);
    await prisma.skillMastery.upsert({
      where: { studentId_skillId: { studentId, skillId: s.id } },
      update: { score, status: statusForScore(score) },
      create: { studentId, skillId: s.id, score, status: statusForScore(score) },
    });
  }

  await prisma.diagnosticState.update({ where: { studentId_subject: { studentId, subject } }, data: { completed: true } });
  await rebuildLearningPath(studentId, subject);
}

export async function recordAttempt(
  studentId: string,
  questionId: string,
  answerIndex: number,
  mode: "diagnostic" | "practice"
) {
  const question = await prisma.question.findUniqueOrThrow({ where: { id: questionId }, include: { skill: true } });
  const correct = answerIndex === question.answerIndex;
  const misconceptions: (string | null)[] = JSON.parse(question.misconceptions || "[]");
  const misconceptionTag = !correct ? misconceptions[answerIndex] ?? null : null;

  await prisma.attempt.create({
    data: { studentId, questionId, correct, answerIndex, misconceptionTag: misconceptionTag ?? undefined, context: mode },
  });

  let masteryScore: number | null = null;
  if (mode === "practice") {
    const mastery = await ensureMasteryRow(studentId, question.skillId);
    const newScore = updateMastery(mastery.score, correct, question.difficulty);
    const status = statusForScore(newScore);
    await prisma.skillMastery.update({ where: { id: mastery.id }, data: { score: newScore, status } });
    masteryScore = newScore;

    if (status === "mastered") {
      await prisma.lessonPlanItem.updateMany({
        where: { studentId, skillId: question.skillId, completedAt: null },
        data: { completedAt: new Date() },
      });
      await rebuildLearningPath(studentId, question.skill.subject as Subject);
    } else if (!correct) {
      // Re-rank path so weak/missed skills bubble up.
      await rebuildLearningPath(studentId, question.skill.subject as Subject);
    }
  }

  // Gamification: points and streak
  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
  const today = new Date().toISOString().slice(0, 10);
  let streak = student.streak;
  if (student.lastActiveDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = student.lastActiveDay === yesterday ? streak + 1 : 1;
  }
  await prisma.student.update({
    where: { id: studentId },
    data: {
      points: student.points + (correct ? 10 : 2),
      streak,
      lastActiveDay: today,
    },
  });

  return {
    correct,
    correctIndex: question.answerIndex,
    explanation: question.explanation,
    masteryScore,
    pointsEarned: correct ? 10 : 2,
  };
}
