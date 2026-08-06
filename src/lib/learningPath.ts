import { prisma } from "./db";
import { MASTERY_THRESHOLD } from "./adaptive";

const SUBJECTS = ["math", "reading", "science", "social"] as const;
export type Subject = (typeof SUBJECTS)[number];

/**
 * Rebuild a student's personalized learning path for one subject.
 * Strategy:
 *  1. Load all skills for the subject at or below the student's grade (+1 grade for stretch).
 *  2. A skill is "eligible" once all its prerequisites are mastered.
 *  3. Rank eligible, not-yet-mastered skills by:
 *     - recent wrong-answer volume tied to that skill (weakness signal)
 *     - lower mastery score first
 *     - grade-level proximity to the student's actual grade
 *  4. Write out ordered LessonPlanItem rows (replacing incomplete ones).
 */
export async function rebuildLearningPath(studentId: string, subject: Subject) {
  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });

  const skills = await prisma.skill.findMany({
    where: { subject, grade: { lte: student.grade + 1 } },
    orderBy: [{ grade: "asc" }, { order: "asc" }],
  });

  const masteries = await prisma.skillMastery.findMany({ where: { studentId, skill: { subject } } });
  const masteryBySkill = new Map(masteries.map((m) => [m.skillId, m]));

  // Weakness signal: count wrong attempts per skill in the last 60 attempts for this subject.
  const recentAttempts = await prisma.attempt.findMany({
    where: { studentId, question: { skill: { subject } } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { question: true },
  });
  const wrongCountBySkill = new Map<string, number>();
  for (const a of recentAttempts) {
    if (!a.correct) {
      wrongCountBySkill.set(a.question.skillId, (wrongCountBySkill.get(a.question.skillId) ?? 0) + 1);
    }
  }

  function isMastered(skillId: string) {
    return (masteryBySkill.get(skillId)?.score ?? 0) >= MASTERY_THRESHOLD;
  }

  function prereqsMet(skill: (typeof skills)[number]) {
    const ids = skill.prereqIds ? skill.prereqIds.split(",").filter(Boolean) : [];
    return ids.every((id) => isMastered(id));
  }

  const candidates = skills.filter((s) => !isMastered(s.id) && prereqsMet(s));

  const scored = candidates.map((s) => {
    const mastery = masteryBySkill.get(s.id)?.score ?? 0;
    const wrongCount = wrongCountBySkill.get(s.id) ?? 0;
    const gradeDistance = Math.abs(s.grade - student.grade);
    // Lower score = higher priority
    const priority = mastery - wrongCount * 15 + gradeDistance * 10;
    let reason = "Next up in your path";
    if (wrongCount >= 2) reason = "You've missed a few of these recently — let's practice!";
    else if (mastery > 0) reason = "Almost there — a little more practice will get you mastered.";
    else if (s.grade < student.grade) reason = "A quick review to strengthen your foundation.";
    else if (s.grade > student.grade) reason = "Ready for a challenge? Try this next-level skill.";
    return { skill: s, priority, reason };
  });

  scored.sort((a, b) => a.priority - b.priority);
  const top = scored.slice(0, 8);

  // Clear incomplete path items for this subject, then recreate in order.
  await prisma.lessonPlanItem.deleteMany({ where: { studentId, subject, completedAt: null } });

  for (let i = 0; i < top.length; i++) {
    const { skill, reason } = top[i];
    await prisma.lessonPlanItem.upsert({
      where: { studentId_skillId: { studentId, skillId: skill.id } },
      update: { order: i, reason, completedAt: null },
      create: { studentId, skillId: skill.id, subject, order: i, reason },
    });
  }

  return top.map((t) => t.skill.id);
}

export async function ensureMasteryRow(studentId: string, skillId: string) {
  return prisma.skillMastery.upsert({
    where: { studentId_skillId: { studentId, skillId } },
    update: {},
    create: { studentId, skillId, score: 0, status: "ready" },
  });
}

export { SUBJECTS };
