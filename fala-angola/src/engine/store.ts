import { useSyncExternalStore } from "react";

// Learner progress, saved on the device. When the app moves to AI Studio +
// Firebase, swap load/save for Firestore reads and writes; nothing else changes.

export type LessonRecord = { score: number; at: string };
export type Card = { box: number; due: string };

export type Progress = {
  name: string;
  xp: number;
  kz: number;
  streak: number;
  freezes: number;
  lastActive: string | null;
  weekStarted: Record<string, string>;
  lessons: Record<string, LessonRecord>;
  cards: Record<string, Card>;
  muted: boolean;
};

const KEY = "fala-angola:v1";
const fresh: Progress = {
  name: "",
  xp: 0,
  kz: 0,
  streak: 0,
  freezes: 1,
  lastActive: null,
  weekStarted: {},
  lessons: {},
  cards: {},
  muted: false,
};

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...fresh, ...JSON.parse(raw) } : fresh;
  } catch {
    return fresh;
  }
}

let state = load();
const listeners = new Set<() => void>();

function set(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: progress lives for this session only.
  }
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  );
}

export const today = (d = new Date()) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return today(d);
};
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);

export const RANKS = [
  { name: "Turista", xp: 0 },
  { name: "Visitante", xp: 300 },
  { name: "Morador", xp: 900 },
  { name: "Kota", xp: 2000 },
  { name: "Mais Velho", xp: 4000 },
];

export function rankFor(xp: number) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  const next = RANKS[i + 1];
  const pct = next ? (xp - RANKS[i].xp) / (next.xp - RANKS[i].xp) : 1;
  return { rank: RANKS[i], next, pct };
}

export function setName(name: string) {
  set({ ...state, name });
}

export function toggleMute() {
  set({ ...state, muted: !state.muted });
}

export function startWeek(weekId: string) {
  if (state.weekStarted[weekId]) return;
  set({ ...state, weekStarted: { ...state.weekStarted, [weekId]: today() } });
}

// Called when a lesson ends. Returns what was earned so the results screen can show it.
export function completeLesson(
  lessonId: string,
  score: number,
  earned: { xp: number; kz: number },
  phraseIds: string[],
) {
  const t = today();
  let { streak, freezes } = state;
  if (state.lastActive !== t) {
    const gap = state.lastActive ? daysBetween(state.lastActive, t) : 0;
    if (gap === 1) streak += 1;
    else if (gap === 2 && freezes > 0) {
      freezes -= 1;
      streak += 1;
    } else streak = 1;
    // One free missed day per 7-day streak, so a busy day never wipes progress.
    if (streak % 7 === 0) freezes = Math.min(freezes + 1, 2);
  }
  const best = Math.max(score, state.lessons[lessonId]?.score ?? 0);
  const cards = { ...state.cards };
  for (const id of phraseIds) if (!cards[id]) cards[id] = { box: 0, due: t };
  set({
    ...state,
    xp: state.xp + earned.xp,
    kz: state.kz + earned.kz,
    streak,
    freezes,
    lastActive: t,
    lessons: { ...state.lessons, [lessonId]: { score: best, at: t } },
    cards,
  });
}

// Spaced review: a phrase you know moves to a longer gap; one you missed comes back tomorrow.
const GAPS = [1, 2, 4, 7, 15, 30];

export function dueCards(): string[] {
  const t = today();
  return Object.entries(state.cards)
    .filter(([, c]) => c.due <= t)
    .map(([id]) => id);
}

export function reviewCard(id: string, knew: boolean) {
  const c = state.cards[id] ?? { box: 0, due: today() };
  const box = knew ? Math.min(c.box + 1, GAPS.length - 1) : 0;
  set({
    ...state,
    xp: state.xp + (knew ? 3 : 1),
    cards: { ...state.cards, [id]: { box, due: addDays(today(), GAPS[box]) } },
  });
}

export function resetProgress() {
  set({ ...fresh, name: state.name });
}

// A week's next lesson opens when the one before it is done.
export function lessonUnlocked(lessonIds: string[], index: number) {
  return index === 0 || Boolean(state.lessons[lessonIds[index - 1]]);
}

export const PASS_MARK = 0.7;
