import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentParent, setActiveStudent } from "@/lib/auth";

const schema = z.object({ studentId: z.string(), pin: z.string() });

export async function POST(req: NextRequest) {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const student = await prisma.student.findFirst({ where: { id: parsed.data.studentId, parentId: parent.id } });
  if (!student || student.pin !== parsed.data.pin) {
    return NextResponse.json({ error: "That PIN doesn't match. Try again!" }, { status: 401 });
  }

  await setActiveStudent(student.id);
  return NextResponse.json({ ok: true });
}
