"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardData {
  student: { firstName: string; grade: number; points: number; streak: number };
  bySubject: Record<string, { mastered: number; total: number; avgScore: number }>;
  totalAttempts: number;
  accuracy: number | null;
  topMisconceptions: { tag: string; count: number; skillName: string; subject: string }[];
  skills: { subject: string; name: string; grade: number; score: number; status: string }[];
}

const SUBJECT_LABEL: Record<string, string> = { math: "Math", reading: "Reading", science: "Science", social: "Social Studies" };

export default function StudentDashboardPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/${studentId}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => d && !d.error && setData(d));
  }, [studentId, router]);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-sm font-bold text-indigo-600 hover:underline">
          ← All students
        </Link>
        <h1 className="text-2xl font-display font-bold text-slate-800 mt-2 mb-6">
          {data.student.firstName}&apos;s Progress — Grade {data.student.grade}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Stat label="Points" value={data.student.points} icon="⭐" />
          <Stat label="Day Streak" value={data.student.streak} icon="🔥" />
          <Stat label="Recent Accuracy" value={data.accuracy !== null ? `${data.accuracy}%` : "—"} icon="🎯" />
          <Stat label="Total Attempts" value={data.totalAttempts} icon="📝" />
        </div>

        <h2 className="font-display font-bold text-lg text-slate-700 mb-3">Progress by Subject</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {Object.entries(data.bySubject).map(([subject, s]) => (
            <div key={subject} className="bg-white rounded-2xl shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{SUBJECT_LABEL[subject]}</span>
                <span className="text-sm text-slate-500">
                  {s.mastered}/{s.total} mastered
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${s.total > 0 ? (s.mastered / s.total) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Average mastery score: {s.avgScore}%</p>
            </div>
          ))}
        </div>

        {data.topMisconceptions.length > 0 && (
          <>
            <h2 className="font-display font-bold text-lg text-slate-700 mb-3">Where {data.student.firstName} Needs the Most Support</h2>
            <div className="bg-white rounded-2xl shadow divide-y divide-slate-100 mb-8">
              {data.topMisconceptions.map((m) => (
                <div key={m.tag} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-700">{formatTag(m.tag)}</div>
                    <div className="text-xs text-slate-400">
                      {SUBJECT_LABEL[m.subject]} • {m.skillName}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-500">{m.count}×</span>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="font-display font-bold text-lg text-slate-700 mb-3">All Skills</h2>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-2.5">Subject</th>
                <th className="px-4 py-2.5">Skill</th>
                <th className="px-4 py-2.5">Grade</th>
                <th className="px-4 py-2.5">Mastery</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.skills.map((sk, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5">{SUBJECT_LABEL[sk.subject]}</td>
                  <td className="px-4 py-2.5 font-semibold">{sk.name}</td>
                  <td className="px-4 py-2.5">{sk.grade}</td>
                  <td className="px-4 py-2.5">{sk.score}%</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        sk.status === "mastered" ? "bg-emerald-100 text-emerald-700" : sk.status === "in-progress" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {sk.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-display font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function formatTag(tag: string): string {
  return tag
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
