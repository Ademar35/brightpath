"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StreakFlame from "./StreakFlame";

interface Props {
  student: { firstName: string; avatar: string; points: number; streak: number };
  active?: "home" | "homework";
}

export default function TopBar({ student, active }: Props) {
  const router = useRouter();

  function switchStudent() {
    router.push("/students");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center justify-between bg-white/80 backdrop-blur rounded-2xl shadow px-4 py-3 mb-6"
    >
      <Link href="/home" className="flex items-center gap-2">
        <motion.span whileHover={{ rotate: 12, scale: 1.15 }} className="text-2xl inline-block">
          🌈
        </motion.span>
        <span className="font-display font-bold text-indigo-700 text-lg hidden sm:inline">BrightPath</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/homework"
          className={`text-sm font-bold px-3 py-1.5 rounded-full transition-colors ${active === "homework" ? "bg-indigo-600 text-white" : "text-indigo-600 hover:bg-indigo-50"}`}
        >
          🙋 Homework Help
        </Link>
        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm overflow-hidden">
          ⭐
          <AnimatePresence mode="popLayout">
            <motion.span
              key={student.points}
              initial={{ y: -14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 14, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {student.points}
            </motion.span>
          </AnimatePresence>
        </div>
        <StreakFlame streak={student.streak} />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={switchStudent}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-full pl-1 pr-3 py-1"
        >
          <span className="text-xl">{student.avatar}</span>
          <span className="text-sm font-bold">{student.firstName}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
