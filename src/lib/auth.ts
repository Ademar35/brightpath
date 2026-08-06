import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import crypto from "crypto";

const SESSION_COOKIE = "brightpath_session";
const STUDENT_COOKIE = "brightpath_student";
const SESSION_DAYS = 30;

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(parentId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, parentId, expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  store.delete(SESSION_COOKIE);
  store.delete(STUDENT_COOKIE);
}

export async function getCurrentParent() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token }, include: { parent: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.parent;
}

export async function setActiveStudent(studentId: string) {
  const store = await cookies();
  store.set(STUDENT_COOKIE, studentId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    path: "/",
  });
}

export async function getActiveStudentId() {
  const store = await cookies();
  return store.get(STUDENT_COOKIE)?.value ?? null;
}

export async function clearActiveStudent() {
  const store = await cookies();
  store.delete(STUDENT_COOKIE);
}

export async function getActiveStudent() {
  const id = await getActiveStudentId();
  if (!id) return null;
  const student = await prisma.student.findUnique({ where: { id } });
  return student;
}
