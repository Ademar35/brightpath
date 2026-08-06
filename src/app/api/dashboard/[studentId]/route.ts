import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentParent } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { studentId } = await params;
  const student = await prisma.student.findFirst({ where: { id: studentId, parentId: parent.id } });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const masteries = await prisma.skillMastery.findMany({
    where: { studentId },
    include: { skill: true },
    orderBy: [{ skill: { subject: "asc" } }, { skill: { grade: "asc" } }, { skill: { order: "asc" } }],
  });

  const recentAttempts = await prisma.attempt.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { question: { include: { skill: true } } },
  });

  const misconceptionCounts = new Map<string, { count: number; skillName: string; subject: string }>();
  for (const a of recentAttempts) {
    if (!a.correct && a.misconceptionTag) {
      const key = a.misconceptionTag;
      const existing = misconceptionCounts.get(key);
      if (existing) existing.count++;
      else misconceptionCounts.set(key, { count: 1, skillName: a.question.skill.name, subject: a.question.skill.subject });
    }
  }
  const topMisconceptions = [...misconceptionCounts.entries()]
    .map(([tag, v]) => ({ tag, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalAttempts = recentAttempts.length;
  const totalCorrect = recentAttempts.filter((a) => a.correct).length;

  const bySubject: Record<string, { mastered: number; total: number; avgScore: number }> = {};
  for (const subject of ["math", "reading", "science", "social"]) {
    const rows = masteries.filter((m) => m.skill.subject === subject);
    const mastered = rows.filter((r) => r.status === "mastered").length;
    const avgScore = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;
    bySubject[subject] = { mastered, total: rows.length, avgScore };
  }

  return NextResponse.json({
    student: { firstName: student.firstName, grade: student.grade, points: student.points, streak: student.streak },
    bySubject,
    totalAttempts,
    accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null,
    topMisconceptions,
    skills: masteries.map((m) => ({
      subject: m.skill.subject,
      name: m.skill.name,
      grade: m.skill.grade,
      score: m.score,
      status: m.status,
    })),
  });
}
