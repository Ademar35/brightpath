// Content model. A Book holds Weeks (one per booklet unit); a Week holds five
// daily Lessons; a Lesson is a list of Activities. Content lives in JSON so a
// new book is new data, not new code.

export type Line = { who: string; pt: string; en: string };

export type Activity =
  | { type: "card"; id: string; title: string; body?: string; rows?: string[][]; note?: string; speakPairs?: boolean }
  | { type: "scene"; id: string; title: string; setting: string; lines: Line[] }
  | { type: "choice"; id: string; question: string; options: string[]; answer: number; explain?: string; say?: string }
  | { type: "gap"; id: string; before: string; after: string; options: string[]; answer: string; en?: string }
  | { type: "type"; id: string; prompt: string; answers: string[]; en?: string }
  | { type: "order"; id: string; words: string[]; answer: string; en?: string }
  | { type: "match"; id: string; title: string; pairs: [string, string][] }
  | { type: "truefalse"; id: string; statement: string; answer: boolean; explain?: string }
  | { type: "repeat"; id: string; pt: string; en: string; focus?: string }
  | { type: "write"; id: string; prompt: string; checklist: string[]; model: string }
  | { type: "branch"; id: string; title: string; who: string; steps: BranchStep[] }
  | { type: "game"; id: string; game: "hora-certa"; rounds: HoraCertaRound[] }
  | { type: "game"; id: string; game: "pares"; pairs: [string, string][] };

export type BranchStep = {
  npc: string;
  en: string;
  options: { text: string; ok: boolean; feedback: string }[];
};

export type HoraCertaRound = { time: string; scene: string; options: string[]; answer: string };

export type LessonKind = "cena" | "frases" | "jogos" | "conversa" | "missao";

export type Lesson = {
  id: string;
  day: number;
  kind: LessonKind;
  title: string;
  subtitle: string;
  minutes: number;
  activities: Activity[];
};

export type Phrase = { id: string; pt: string; en: string };

export type Week = {
  id: string;
  number: number;
  unit: string;
  title: string;
  titleEn: string;
  tagline: string;
  grammar: string[];
  vocabulary: string[];
  sounds: string[];
  mission: string;
  lessons: Lesson[];
  phrases: Phrase[];
};

export type WeekStub = {
  number: number;
  title: string;
  titleEn: string;
  game: string;
  mission: string;
  status: "ready" | "planned" | "awaiting-content";
};
