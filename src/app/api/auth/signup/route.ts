import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill out all fields correctly (password min 6 characters)." }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.parent.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const parent = await prisma.parent.create({ data: { name, email, passwordHash } });
  await createSession(parent.id);

  return NextResponse.json({ ok: true, parent: { id: parent.id, name: parent.name, email: parent.email } });
}
