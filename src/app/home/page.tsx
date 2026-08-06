"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import TopBar from "@/components/TopBar";
import { getBuddy } from "@/lib/buddies";

interface Me {
  id: string;
  firstName: string;
  grade: number;
  avatar: string;
  buddyId: string;
  points: number;
  streak: number;
}

const SUBJECTS = [
  { id: "math", name: "Math", emoji: "🔢", color: "from-blue-400 to-indigo-500" },
  { id: "reading", name: "Reading", emoji: "📚", color: "from-pink-400 to-rose-500" },
  { id: "science", name: "Science", emoji: "🔬", color: "from-emerald-400 to-teal-500" },
  { id: "social", name: "Social Studies", emoji: "🌍", color: "from-amber-400 to-orange-500" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const item = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.student) router.push("/students");
        else setMe(d.student);
      });
  }, [router]);

  if (!me) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  const buddy = getBuddy(me.buddyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <TopBar student={me} active="home" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-lg p-6 mb-6 flex items-center gap-4"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className={`text-5xl w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br ${buddy.color} shrink-0`}
          >
            {buddy.avatar}
          </motion.div>
          <div>
            <p className="font-display font-bold text-xl">
              Hi {me.firstName}! {buddy.name} here. 👋
            </p>
            <p className="text-slate-500 text-sm">Ready to learn something awesome today? Pick a subject below!</p>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 sm:gap-5">
          {SUBJECTS.map((s) => (
            <motion.button
              key={s.id}
              variants={item}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/subject/${s.id}`)}
              className={`rounded-3xl shadow-lg p-6 text-white text-left bg-gradient-to-br ${s.color} transition-shadow hover:shadow-2xl`}
            >
              <div className="text-4xl mb-2">{s.emoji}</div>
              <div className="font-display font-bold text-xl">{s.name}</div>
              <div className="text-white/80 text-sm mt-1">Practice & Your Path</div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
