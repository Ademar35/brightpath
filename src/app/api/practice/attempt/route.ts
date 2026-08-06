import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveStudentId } from "@/lib/auth";
import { recordAttempt } from "@/lib/practice";

const schema = z.object({
  questionId: z.string(),
  answerIndex: z.number().int().min(0),
  mode: z.enum(["diagnostic", "practice"]),
});

export async function POST(req: NextRequest) {
  const studentId = await getActiveStudentId();
  if (!studentId) return NextResponse.json({ error: "No active student" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const result = await recordAttempt(studentId, parsed.data.questionId, parsed.data.answerIndex, parsed.data.mode);
  return NextResponse.json(result);
}
