"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import TopBar from "@/components/TopBar";
import ChatPanel from "@/components/ChatPanel";
import CelebrationToast, { Celebration, pointsToLevel } from "@/components/CelebrationToast";
import { getBuddy } from "@/lib/buddies";

interface Me {
  firstName: string;
  avatar: string;
  points: number;
  streak: number;
  buddyId: string;
}

interface QuestionOut {
  id: string;
  prompt: string;
  choices: string[];
  difficulty: number;
  skillId: string;
  skillName: string;
}

type ApiResult = {
  mode: "diagnostic" | "practice" | "done";
  question?: QuestionOut;
  progress?: { current: number; total: number };
};

const SUBJECT_META: Record<string, { name: string; color: string }> = {
  math: { name: "Math", color: "from-blue-400 to-indigo-500" },
  reading: { name: "Reading", color: "from-pink-400 to-rose-500" },
  science: { name: "Science", color: "from-emerald-400 to-teal-500" },
  social: { name: "Social Studies", color: "from-amber-400 to-orange-500" },
};

function burstConfetti() {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 38,
    origin: { y: 0.6 },
    colors: ["#818cf8", "#f472b6", "#34d399", "#fbbf24", "#60a5fa"],
  });
}

export default function PracticePage() {
  const { subject } = useParams<{ subject: string }>();
  const router = useRouter();
  const meta = SUBJECT_META[subject] ?? SUBJECT_META.math;
  const [me, setMe] = useState<Me | null>(null);
  const [state, setState] = useState<ApiResult | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; correctIndex: number; explanation: string; pointsEarned: number; masteryScore: number | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [wrongShake, setWrongShake] = useState(0);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const lastLevelRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (!d.student) router.push("/students");
      else {
        setMe(d.student);
        lastLevelRef.current = pointsToLevel(d.student.points);
      }
    });
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  function loadNext() {
    setSelected(null);
    setFeedback(null);
    setLoading(true);
    fetch(`/api/practice/next?subject=${subject}`)
      .then((r) => r.json())
      .then((d: ApiResult) => setState(d))
      .finally(() => setLoading(false));
  }

  async function submitAnswer(idx: number) {
    if (selected !== null || !state?.question) return;
    setSelected(idx);
    const res = await fetch("/api/practice/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: state.question.id, answerIndex: idx, mode: state.mode }),
    });
    const data = await res.json();
    setFeedback(data);

    if (data.correct) {
      burstConfetti();
    } else {
      setWrongShake((n) => n + 1);
    }

    if (me) {
      const newPoints = me.points + data.pointsEarned;
      setMe({ ...me, points: newPoints });
      const newLevel = pointsToLevel(newPoints);
      if (lastLevelRef.current !== null && newLevel > lastLevelRef.current) {
        setTimeout(() => {
          setCelebration({
            id: `level-${newLevel}`,
            emoji: "🏆",
            title: `Level ${newLevel}!`,
            subtitle: "You're on fire — keep it up!",
            color: "from-amber-400 to-orange-500",
          });
          burstConfetti();
        }, 500);
      }
      lastLevelRef.current = newLevel;
    }

    if (data.masteryScore !== null && data.masteryScore >= 80) {
      setTimeout(() => {
        setCelebration({
          id: `mastery-${state.question!.skillId}`,
          emoji: "🎓",
          title: "Skill Mastered!",
          subtitle: `${state.question!.skillName} — nice work!`,
          color: "from-emerald-400 to-teal-500",
        });
      }, data.correct ? 900 : 200);
    }
  }

  if (!me) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  const buddy = getBuddy(me.buddyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4 sm:p-6">
      <CelebrationToast celebration={celebration} onDone={() => setCelebration(null)} />

      <div className="max-w-5xl mx-auto">
        <TopBar student={me} />

        <AnimatePresence mode="wait">
          {state?.mode === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                  className="text-6xl mb-3"
                >
                  🎉
                </motion.div>
                <h1 className="text-2xl font-display font-bold text-indigo-700 mb-2">Amazing work!</h1>
                <p className="text-slate-500 mb-6">
                  You&apos;ve mastered everything on your path right now. Check back after a bit for new challenges!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push(`/subject/${subject}`)}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold"
                >
                  Back to {meta.name}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="session" className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div>
                {state?.mode === "diagnostic" && state.progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>Quick Quiz</span>
                      <span>
                        {state.progress.current} / {state.progress.total}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2.5 shadow-inner overflow-hidden">
                      <motion.div
                        className={`bg-gradient-to-r ${meta.color} h-2.5 rounded-full`}
                        animate={{ width: `${(state.progress.current / state.progress.total) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {loading || !state?.question ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-3xl shadow-lg p-10 text-center text-slate-400"
                    >
                      Loading question...
                    </motion.div>
                  ) : (
                    <motion.div
                      key={state.question.id}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: wrongShake > 0 && !feedback ? 0 : 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 relative overflow-hidden"
                    >
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-2">{state.question.skillName}</p>
                      <p className="text-lg sm:text-xl font-bold text-slate-800 mb-6 whitespace-pre-wrap">{state.question.prompt}</p>

                      <motion.div
                        className="space-y-3"
                        key={`choices-${wrongShake}`}
                        animate={!feedback?.correct && feedback ? { x: [0, -8, 8, -8, 0] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        {state.question.choices.map((choice, idx) => {
                          let style = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50";
                          if (selected !== null) {
                            if (idx === feedback?.correctIndex) style = "border-emerald-400 bg-emerald-50";
                            else if (idx === selected) style = "border-red-300 bg-red-50";
                            else style = "border-slate-100 opacity-60";
                          }
                          return (
                            <motion.button
                              key={idx}
                              disabled={selected !== null}
                              whileHover={selected === null ? { scale: 1.015, x: 3 } : {}}
                              whileTap={selected === null ? { scale: 0.98 } : {}}
                              animate={idx === feedback?.correctIndex && feedback ? { scale: [1, 1.03, 1] } : {}}
                              onClick={() => submitAnswer(idx)}
                              className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 font-semibold text-slate-700 transition-colors ${style}`}
                            >
                              {choice}
                            </motion.button>
                          );
                        })}
                      </motion.div>

                      <AnimatePresence>
                        {feedback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mt-5 p-4 rounded-2xl ${feedback.correct ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}
                          >
                            <p className="font-bold mb-1">
                              {feedback.correct ? `Nice job! +${feedback.pointsEarned} points ⭐` : `Not quite — +${feedback.pointsEarned} points for trying!`}
                            </p>
                            <p className="text-sm">{feedback.explanation}</p>
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={loadNext}
                              className="mt-3 px-5 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-sm"
                            >
                              Next Question →
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ChatPanel
                buddy={buddy}
                mode="practice"
                questionContext={state?.question ? { prompt: state.question.prompt, choices: state.question.choices } : null}
                className="h-[520px]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
