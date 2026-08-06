import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const parent = await prisma.parent.findUnique({ where: { email } });
  if (!parent || !(await verifyPassword(password, parent.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await createSession(parent.id);
  return NextResponse.json({ ok: true, parent: { id: parent.id, name: parent.name, email: parent.email } });
}
