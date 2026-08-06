import { NextRequest, NextResponse } from "next/server";
import { getActiveStudentId } from "@/lib/auth";
import { getNextQuestion } from "@/lib/practice";
import { Subject } from "@/lib/learningPath";

const VALID: Subject[] = ["math", "reading", "science", "social"];

export async function GET(req: NextRequest) {
  const studentId = await getActiveStudentId();
  if (!studentId) return NextResponse.json({ error: "No active student" }, { status: 401 });

  const subject = req.nextUrl.searchParams.get("subject") as Subject | null;
  if (!subject || !VALID.includes(subject)) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }

  const result = await getNextQuestion(studentId, subject);
  return NextResponse.json(result);
}
