import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentParent } from "@/lib/auth";

const createSchema = z.object({
  firstName: z.string().min(1).max(40),
  grade: z.number().int().min(1).max(8),
  avatar: z.string().min(1).max(8),
  pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
  buddyId: z.string().min(1),
});

export async function GET() {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const students = await prisma.student.findMany({ where: { parentId: parent.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({
    students: students.map((s) => ({ id: s.id, firstName: s.firstName, grade: s.grade, avatar: s.avatar, buddyId: s.buddyId, points: s.points, streak: s.streak })),
  });
}

export async function POST(req: NextRequest) {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const count = await prisma.student.count({ where: { parentId: parent.id } });
  if (count >= 6) {
    return NextResponse.json({ error: "You can have up to 6 student profiles." }, { status: 400 });
  }

  const student = await prisma.student.create({
    data: { ...parsed.data, parentId: parent.id },
  });

  return NextResponse.json({ student: { id: student.id, firstName: student.firstName, grade: student.grade, avatar: student.avatar } });
}
