"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { buddies } from "@/lib/buddies";

const gridContainer = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const gridItem = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface StudentRow {
  id: string;
  firstName: string;
  grade: number;
  avatar: string;
  buddyId: string;
  points: number;
  streak: number;
}

const AVATARS = ["🦊", "🐼", "🦁", "🐸", "🐧", "🦄", "🐶", "🐱", "🦉", "🐢", "🦋", "🐬"];

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pinTarget, setPinTarget] = useState<StudentRow | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => setStudents(d.students ?? []));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-100 to-purple-200 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 pt-4">
          <h1 className="text-3xl font-display font-bold text-indigo-700">Who&apos;s learning today? 🎒</h1>
          <div className="flex gap-3">
            <Link href="/dashboard" className="text-sm font-bold text-indigo-600 hover:underline self-center">
              Parent Dashboard
            </Link>
            <button onClick={logout} className="text-sm font-bold text-slate-500 hover:underline self-center">
              Log out
            </button>
          </div>
        </div>

        {students === null ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <motion.div variants={gridContainer} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {students.map((s) => (
              <motion.button
                key={s.id}
                variants={gridItem}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setPinTarget(s)}
                className="bg-white rounded-3xl shadow-lg p-5 flex flex-col items-center gap-2 transition-shadow hover:shadow-2xl"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: Math.random() }}
                  className="text-6xl"
                >
                  {s.avatar}
                </motion.div>
                <div className="font-display font-bold text-lg">{s.firstName}</div>
                <div className="text-xs text-slate-500 font-semibold">Grade {s.grade}</div>
                <div className="text-xs text-amber-500 font-bold">⭐ {s.points} pts</div>
              </motion.button>
            ))}
            <motion.button
              variants={gridItem}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="bg-white/60 border-4 border-dashed border-indigo-300 rounded-3xl shadow p-5 flex flex-col items-center justify-center gap-2 hover:bg-white/90 transition-colors min-h-[160px]"
            >
              <div className="text-4xl text-indigo-400">+</div>
              <div className="font-bold text-indigo-500">Add Student</div>
            </motion.button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateStudentModal
            onClose={() => setShowCreate(false)}
            onCreated={(s) => {
              setStudents((prev) => [...(prev ?? []), s as StudentRow]);
              setShowCreate(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pinTarget && (
          <PinModal
            student={pinTarget}
            onClose={() => setPinTarget(null)}
            onSuccess={() => {
              router.push("/home");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: unknown) => void }) {
  const [firstName, setFirstName] = useState("");
  const [grade, setGrade] = useState(3);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [buddyId, setBuddyId] = useState(buddies[0].id);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, grade, avatar, pin, buddyId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    onCreated({ ...data.student, buddyId, points: 0, streak: 0 });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-display font-bold text-indigo-700 mb-4">New Student</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600">First Name</label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none"
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 mb-1 block">Pick an Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => (
                <motion.button
                  type="button"
                  key={a}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAvatar(a)}
                  className={`text-3xl p-1.5 rounded-xl border-2 ${avatar === a ? "border-indigo-500 bg-indigo-50" : "border-transparent"}`}
                >
                  {a}
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 mb-1 block">Choose a Study Buddy</label>
            <div className="grid grid-cols-2 gap-2">
              {buddies.map((b) => (
                <motion.button
                  type="button"
                  key={b.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setBuddyId(b.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-colors ${buddyId === b.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}`}
                >
                  <span className="text-2xl">{b.avatar}</span>
                  <span className="text-sm font-bold">{b.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600">4-Digit PIN (so your kid can log in)</label>
            <input
              required
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none tracking-widest text-center text-xl"
              placeholder="1234"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600">
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function PinModal({ student, onClose, onSuccess }: { student: StudentRow; onClose: () => void; onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/students/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, pin }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Incorrect PIN.");
      setShake((n) => n + 1);
      setPin("");
      return;
    }
    onSuccess();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xs text-center"
      >
        <div className="text-6xl mb-2">{student.avatar}</div>
        <h2 className="text-xl font-display font-bold mb-4">Hi {student.firstName}! Enter your PIN</h2>
        <form onSubmit={submit} className="space-y-3">
          <motion.input
            key={shake}
            animate={shake > 0 ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            autoFocus
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none tracking-[0.5em] text-center text-2xl"
            placeholder="••••"
          />
          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600">
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-60"
            >
              {loading ? "..." : "Go!"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
