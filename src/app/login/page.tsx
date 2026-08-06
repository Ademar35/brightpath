"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/students");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-indigo-100 to-purple-200 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 animate-pop-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌈</div>
          <h1 className="text-3xl font-display font-bold text-indigo-700">BrightPath</h1>
          <p className="text-slate-500 mt-1">Welcome back! Sign in to continue.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none"
              placeholder="parent@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-5">
          New here?{" "}
          <Link href="/signup" className="text-indigo-600 font-bold hover:underline">
            Create a parent account
          </Link>
        </p>
      </div>
    </div>
  );
}
