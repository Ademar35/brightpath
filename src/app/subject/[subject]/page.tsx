"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";

const listContainer = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const listItem = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface Me {
  firstName: string;
  avatar: string;
  points: number;
  streak: number;
}

interface PathItem {
  skillId: string;
  name: string;
  description: string;
  grade: number;
  reason: string;
  masteryScore: number;
}

interface Mastered {
  skillId: string;
  name: string;
  grade: number;
}

const SUBJECT_META: Record<string, { name: string; emoji: string; color: string }> = {
  math: { name: "Math", emoji: "🔢", color: "from-blue-400 to-indigo-500" },
  reading: { name: "Reading", emoji: "📚", color: "from-pink-400 to-rose-500" },
  science: { name: "Science", emoji: "🔬", color: "from-emerald-400 to-teal-500" },
  social: { name: "Social Studies", emoji: "🌍", color: "from-amber-400 to-orange-500" },
};

export default function SubjectPage() {
  const { subject } = useParams<{ subject: string }>();
  const router = useRouter();
  const meta = SUBJECT_META[subject] ?? SUBJECT_META.math;
  const [me, setMe] = useState<Me | null>(null);
  const [diagnosticCompleted, setDiagnosticCompleted] = useState<boolean | null>(null);
  const [upcoming, setUpcoming] = useState<PathItem[]>([]);
  const [mastered, setMastered] = useState<Mastered[]>([]);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (!d.student) router.push("/students");
      else setMe(d.student);
    });
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  function load() {
    fetch(`/api/path?subject=${subject}`)
      .then((r) => r.json())
      .then((d) => {
        setDiagnosticCompleted(d.diagnosticCompleted);
        setUpcoming(d.upcoming ?? []);
        setMastered(d.mastered ?? []);
      });
  }

  if (!me) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <TopBar student={me} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`rounded-3xl shadow-lg p-6 mb-6 text-white bg-gradient-to-br ${meta.color} flex items-center justify-between`}
        >
          <div>
            <motion.div
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              className="text-3xl mb-1 inline-block"
            >
              {meta.emoji}
            </motion.div>
            <h1 className="text-2xl font-display font-bold">{meta.name}</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push(`/practice/${subject}`)}
            className="bg-white text-indigo-700 font-bold px-5 py-3 rounded-2xl shadow"
          >
            {diagnosticCompleted === false ? "Start Quick Quiz →" : "Practice Now →"}
          </motion.button>
        </motion.div>

        {diagnosticCompleted === false && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-3xl shadow p-5 mb-6 text-center"
          >
            <p className="text-slate-600">
              Let&apos;s find out what you already know! Take a short quiz (about 10 questions) so we can build your personal learning path.
            </p>
          </motion.div>
        )}

        {diagnosticCompleted && (
          <>
            <h2 className="font-display font-bold text-lg text-indigo-700 mb-3">🗺️ Your Path</h2>
            <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3 mb-8">
              {upcoming.length === 0 && (
                <p className="text-slate-500 bg-white rounded-2xl p-5">You&apos;re all caught up! Come back after more practice.</p>
              )}
              <AnimatePresence>
                {upcoming.map((item, i) => (
                  <motion.div
                    key={item.skillId}
                    variants={listItem}
                    layout
                    className={`bg-white rounded-2xl shadow p-4 flex items-center gap-4 ${i === 0 ? "ring-2 ring-indigo-400" : "opacity-80"}`}
                  >
                    <motion.div
                      animate={i === 0 ? { boxShadow: ["0 0 0 0 rgba(99,102,241,0.4)", "0 0 0 8px rgba(99,102,241,0)"] } : {}}
                      transition={i === 0 ? { duration: 1.6, repeat: Infinity } : {}}
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-white shrink-0 ${
                        i === 0 ? `bg-gradient-to-br ${meta.color}` : "bg-slate-300"
                      }`}
                    >
                      {i + 1}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.reason}</div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <motion.div
                          className="bg-emerald-400 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.masteryScore}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    {i === 0 && (
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => router.push(`/lesson/${item.skillId}`)}
                        className="text-xs font-bold bg-indigo-600 text-white px-3 py-2 rounded-full shrink-0"
                      >
                        Start
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {mastered.length > 0 && (
              <>
                <h2 className="font-display font-bold text-lg text-emerald-700 mb-3">🏆 Mastered</h2>
                <motion.div variants={listContainer} initial="hidden" animate="show" className="flex flex-wrap gap-2">
                  {mastered.map((m) => (
                    <motion.span
                      key={m.skillId}
                      variants={listItem}
                      whileHover={{ scale: 1.08 }}
                      className="bg-emerald-100 text-emerald-700 font-bold text-sm px-3 py-1.5 rounded-full"
                    >
                      ✓ {m.name}
                    </motion.span>
                  ))}
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
