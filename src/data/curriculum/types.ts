export interface GenQuestion {
  difficulty: number; // 1-5
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  misconceptions: (string | null)[]; // tag per choice index (null for correct)
}

export interface SkillDef {
  id: string;
  subject: "math" | "reading" | "science" | "social";
  grade: number;
  order: number;
  name: string;
  description: string;
  lesson: string; // markdown
  prereqIds: string[];
  generate: () => GenQuestion[]; // called at seed time
}

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build an MCQ with shuffled choices. wrong = [choice, misconceptionTag][] */
export function mcq(
  difficulty: number,
  prompt: string,
  correct: string,
  wrong: [string, string][],
  explanation: string
): GenQuestion {
  const items: { text: string; tag: string | null }[] = [
    { text: correct, tag: null },
    ...wrong.map(([text, tag]) => ({ text, tag })),
  ];
  const shuffled = shuffle(items);
  return {
    difficulty,
    prompt,
    choices: shuffled.map((i) => i.text),
    answerIndex: shuffled.findIndex((i) => i.tag === null),
    explanation,
    misconceptions: shuffled.map((i) => i.tag),
  };
}

/** Deduplicate generated questions by prompt. */
export function uniqueByPrompt(qs: GenQuestion[]): GenQuestion[] {
  const seen = new Set<string>();
  return qs.filter((q) => {
    if (seen.has(q.prompt)) return false;
    seen.add(q.prompt);
    return true;
  });
}
