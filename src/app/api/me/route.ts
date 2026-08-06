import { NextResponse } from "next/server";
import { getActiveStudent } from "@/lib/auth";

export async function GET() {
  const student = await getActiveStudent();
  if (!student) return NextResponse.json({ student: null });
  return NextResponse.json({
    student: {
      id: student.id,
      firstName: student.firstName,
      grade: student.grade,
      avatar: student.avatar,
      buddyId: student.buddyId,
      points: student.points,
      streak: student.streak,
    },
  });
}
