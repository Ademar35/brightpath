import { speak } from "../../engine/speech";

// What an activity reports back to the lesson player.
// total = 0 means the activity is not graded (cards, scenes, speaking).
export type Result = { correct: number; total: number; feedback?: string };
export type ActivityProps<A> = { activity: A; onResult: (r: Result) => void; locked: boolean };

export function SpeakButton({ text, label = "Ouvir" }: { text: string; label?: string }) {
  return (
    <span className="speak">
      <button type="button" className="icon-btn" onClick={() => speak(text)} aria-label={`${label}: ${text}`}>
        ▶
      </button>
      <button type="button" className="icon-btn slow" onClick={() => speak(text, true)} aria-label={`Ouvir devagar: ${text}`}>
        ½
      </button>
    </span>
  );
}

// Accept answers without accents, but tell the learner.
export const plain = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.!?,]/g, "")
    .replace(/\s+/g, " ");

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
