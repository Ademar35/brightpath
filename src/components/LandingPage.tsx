"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buddies } from "@/lib/buddies";

const FEATURES = [
  {
    emoji: "🧠",
    title: "Adaptive Practice",
    body: "A quick diagnostic finds exactly where your kid is, then every question adjusts in real time — never too easy, never too hard.",
  },
  {
    emoji: "🗺️",
    title: "Personalized Path",
    body: "We track every wrong answer and figure out the real misconception behind it, then build a lesson path just for them.",
  },
  {
    emoji: "🙋",
    title: "AI Study Buddies",
    body: "Four AI companions with real personalities give hints and guiding questions — never the answer — so kids learn to think it through.",
  },
  {
    emoji: "📊",
    title: "Parent Dashboard",
    body: "See mastery by subject, accuracy trends, and exactly which misconceptions are holding your kid back.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 overflow-x-hidden">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌈</span>
          <span className="font-display font-bold text-xl text-indigo-700">BrightPath</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 px-3 py-2">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-full shadow-lg shadow-indigo-200 transition"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto text-center px-6 pt-10 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow text-sm font-bold text-indigo-600 mb-6"
        >
          ✨ Learning that adapts to your kid, not the other way around
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-display font-extrabold text-slate-800 leading-tight mb-5"
        >
          Homework help that <span className="text-indigo-600">actually teaches</span>, for grades 1–8
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-500 max-w-2xl mx-auto mb-8"
        >
          BrightPath pairs adaptive practice in Math, Reading, Science, and Social Studies with a friendly AI study
          buddy who guides your kid to the answer — never just hands it over.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-200 transition hover:scale-105"
          >
            Start Free — No Card Needed
          </Link>
          <Link
            href="/login"
            className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-lg shadow-lg transition hover:scale-105"
          >
            I Already Have an Account
          </Link>
        </motion.div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto px-6 mb-20"
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <p className="text-center text-sm font-bold text-indigo-500 uppercase tracking-wide mb-6">
            Meet the Study Buddies
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {buddies.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className={`rounded-2xl p-4 text-center bg-gradient-to-br ${b.color} text-white shadow-lg cursor-default`}
              >
                <div className="text-4xl mb-2">{b.avatar}</div>
                <div className="font-display font-bold">{b.name}</div>
                <div className="text-xs text-white/80 mt-1">{b.tagline}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-2 gap-5"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={item}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl shadow-lg p-6 transition-shadow hover:shadow-2xl"
          >
            <div className="text-4xl mb-3">{f.emoji}</div>
            <h3 className="font-display font-bold text-lg text-slate-800 mb-1.5">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto px-6 pb-24 text-center"
      >
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 text-white">
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">Ready to make homework click?</h2>
          <p className="text-indigo-100 mb-6">Free to start. Set up your first student profile in under a minute.</p>
          <Link
            href="/signup"
            className="inline-block px-7 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-lg shadow-xl transition hover:scale-105"
          >
            Create Your Free Account
          </Link>
        </div>
      </motion.section>

      <footer className="text-center text-slate-400 text-sm pb-8">🌈 BrightPath — Learning made fun.</footer>
    </div>
  );
}
