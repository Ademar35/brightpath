import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveStudentId } from "@/lib/auth";
import { Subject } from "@/lib/learningPath";

const VALID: Subject[] = ["math", "reading", "science", "social"];

export async function GET(req: NextRequest) {
  const studentId = await getActiveStudentId();
  if (!studentId) return NextResponse.json({ error: "No active student" }, { status: 401 });

  const subject = req.nextUrl.searchParams.get("subject") as Subject | null;
  if (!subject || !VALID.includes(subject)) return NextResponse.json({ error: "Invalid subject" }, { status: 400 });

  const diag = await prisma.diagnosticState.findUnique({ where: { studentId_subject: { studentId, subject } } });

  const [upcoming, mastered] = await Promise.all([
    prisma.lessonPlanItem.findMany({
      where: { studentId, subject, completedAt: null },
      orderBy: { order: "asc" },
      include: { skill: true },
    }),
    prisma.skillMastery.findMany({
      where: { studentId, status: "mastered", skill: { subject } },
      include: { skill: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const masteries = await prisma.skillMastery.findMany({ where: { studentId, skill: { subject } } });
  const masteryMap = new Map(masteries.map((m) => [m.skillId, m.score]));

  return NextResponse.json({
    diagnosticCompleted: diag?.completed ?? false,
    upcoming: upcoming.map((p) => ({
      skillId: p.skillId,
      name: p.skill.name,
      description: p.skill.description,
      grade: p.skill.grade,
      reason: p.reason,
      masteryScore: masteryMap.get(p.skillId) ?? 0,
    })),
    mastered: mastered.map((m) => ({ skillId: m.skillId, name: m.skill.name, grade: m.skill.grade })),
  });
}
