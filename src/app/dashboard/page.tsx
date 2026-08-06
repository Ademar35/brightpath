"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentRow {
  id: string;
  firstName: string;
  grade: number;
  avatar: string;
  points: number;
  streak: number;
}

export default function DashboardListPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[] | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => d && setStudents(d.students ?? []));
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-display font-bold text-slate-800">Parent Dashboard</h1>
          <a href="/students" className="text-sm font-bold text-indigo-600 hover:underline">
            ← Back to profiles
          </a>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {students?.map((s) => (
            <button
              key={s.id}
              onClick={() => router.push(`/dashboard/${s.id}`)}
              className="bg-white rounded-2xl shadow p-5 flex items-center gap-4 text-left hover:shadow-md transition"
            >
              <span className="text-4xl">{s.avatar}</span>
              <div>
                <div className="font-bold text-lg">{s.firstName}</div>
                <div className="text-sm text-slate-500">Grade {s.grade} • ⭐ {s.points} pts • 🔥 {s.streak} day streak</div>
              </div>
            </button>
          ))}
          {students?.length === 0 && <p className="text-slate-400">No student profiles yet.</p>}
        </div>
      </div>
    </div>
  );
}
