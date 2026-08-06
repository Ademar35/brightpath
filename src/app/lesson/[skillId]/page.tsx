"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { renderLessonMarkdown } from "@/lib/markdown";

interface Me {
  firstName: string;
  avatar: string;
  points: number;
  streak: number;
}

interface SkillInfo {
  id: string;
  name: string;
  description: string;
  lesson: string;
  subject: string;
  grade: number;
}

export default function LessonPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [skill, setSkill] = useState<SkillInfo | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (!d.student) router.push("/students");
      else setMe(d.student);
    });
    fetch(`/api/skills/${skillId}`)
      .then((r) => r.json())
      .then((d) => setSkill(d));
  }, [skillId, router]);

  if (!me || !skill) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <TopBar student={me} />

        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 animate-pop-in">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">Grade {skill.grade} • {skill.subject}</p>
          <h1 className="text-2xl font-display font-bold text-slate-800 mb-4">{skill.name}</h1>
          <div className="lesson-content" dangerouslySetInnerHTML={{ __html: renderLessonMarkdown(skill.lesson) }} />

          <button
            onClick={() => router.push(`/practice/${skill.subject}`)}
            className="mt-6 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 transition"
          >
            Start Practicing →
          </button>
        </div>
      </div>
    </div>
  );
}
