import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveStudentId } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studentId = await getActiveStudentId();
  if (!studentId) return NextResponse.json({ error: "No active student" }, { status: 401 });

  const { id } = await params;
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    lesson: skill.lesson,
    subject: skill.subject,
    grade: skill.grade,
  });
}
