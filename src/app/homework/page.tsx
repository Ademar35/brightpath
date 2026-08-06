"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import ChatPanel from "@/components/ChatPanel";
import { getBuddy } from "@/lib/buddies";

interface Me {
  firstName: string;
  avatar: string;
  points: number;
  streak: number;
  buddyId: string;
}

export default function HomeworkPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (!d.student) router.push("/students");
      else setMe(d.student);
    });
  }, [router]);

  if (!me) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  const buddy = getBuddy(me.buddyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <TopBar student={me} active="homework" />
        <h1 className="text-2xl font-display font-bold text-indigo-700 mb-4">🙋 Homework Help</h1>
        <p className="text-slate-500 mb-4 text-sm">
          Got a tricky homework problem? Type it in and {buddy.name} will help you work through it step by step.
        </p>
        <ChatPanel buddy={buddy} mode="homework" className="h-[60vh]" />
      </div>
    </div>
  );
}
