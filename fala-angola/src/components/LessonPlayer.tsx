import { useState } from "react";
import type { Activity, Lesson, Week } from "../content/types";
import { completeLesson, PASS_MARK } from "../engine/store";
import { sfx } from "../engine/sound";
import {
  BranchView,
  CardView,
  ChoiceView,
  GapView,
  MatchView,
  OrderView,
  RepeatView,
  SceneView,
  TrueFalseView,
  TypeView,
  WriteView,
} from "./activities/Activities";
import type { Result } from "./activities/shared";
import { HoraCertaGame, ParesGame } from "./games/Games";

const XP_PER_CORRECT = 10;
const XP_PER_STEP = 3;
const KZ_PER_CORRECT = 5;

function ActivityView({ a, onResult, locked }: { a: Activity; onResult: (r: Result) => void; locked: boolean }) {
  const p = { onResult, locked };
  switch (a.type) {
    case "card":
      return <CardView activity={a} {...p} />;
    case "scene":
      return <SceneView activity={a} {...p} />;
    case "choice":
      return <ChoiceView activity={a} {...p} />;
    case "gap":
      return <GapView activity={a} {...p} />;
    case "type":
      return <TypeView activity={a} {...p} />;
    case "order":
      return <OrderView activity={a} {...p} />;
    case "match":
      return <MatchView activity={a} {...p} />;
    case "truefalse":
      return <TrueFalseView activity={a} {...p} />;
    case "repeat":
      return <RepeatView activity={a} {...p} />;
    case "write":
      return <WriteView activity={a} {...p} />;
    case "branch":
      return <BranchView activity={a} {...p} />;
    case "game":
      return a.game === "hora-certa" ? <HoraCertaGame activity={a} {...p} /> : <ParesGame activity={a} {...p} />;
  }
}

export function LessonPlayer({ week, lesson, onExit }: { week: Week; lesson: Lesson; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [tally, setTally] = useState({ correct: 0, total: 0, steps: 0 });
  const [finished, setFinished] = useState<null | { score: number; xp: number; kz: number; passed: boolean }>(null);
  const a = lesson.activities[idx];
  const isMission = lesson.kind === "missao";

  const onResult = (r: Result) => {
    if (result) return;
    setResult(r);
    if (r.total > 0) (r.correct === r.total ? sfx.correct : r.correct === 0 ? sfx.wrong : sfx.tap)();
  };

  const next = () => {
    const t = {
      correct: tally.correct + (result?.correct ?? 0),
      total: tally.total + (result?.total ?? 0),
      steps: tally.steps + 1,
    };
    setTally(t);
    setResult(null);
    if (idx + 1 < lesson.activities.length) {
      setIdx(idx + 1);
      return;
    }
    const score = t.total ? t.correct / t.total : 1;
    const passed = !isMission || score >= PASS_MARK;
    const xp = t.correct * XP_PER_CORRECT + t.steps * XP_PER_STEP + (isMission && passed ? 100 : 0);
    const kz = t.correct * KZ_PER_CORRECT + (isMission && passed ? 500 : 0);
    if (passed) completeLesson(lesson.id, score, { xp, kz }, week.phrases.map((p) => p.id));
    sfx.win();
    setFinished({ score, xp: passed ? xp : 0, kz: passed ? kz : 0, passed });
  };

  if (finished)
    return (
      <div className="screen results">
        <p className="eyebrow">{finished.passed ? (isMission ? "Missão cumprida" : "Lição concluída") : "Quase!"}</p>
        <h1>{Math.round(finished.score * 100)}%</h1>
        {finished.passed ? (
          <div className="earn">
            <div>
              <strong>+{finished.xp}</strong>
              <span>XP</span>
            </div>
            <div>
              <strong>+{finished.kz}</strong>
              <span>Kz</span>
            </div>
          </div>
        ) : (
          <p className="lead">You need {Math.round(PASS_MARK * 100)}% to complete the mission. Every try makes the next one easier.</p>
        )}
        {isMission && finished.passed && (
          <p className="lead">Week 1 complete. The phrases you met are now in your Revisão deck. Week 2 opens next week.</p>
        )}
        <button type="button" className="primary wide" onClick={onExit}>
          Continuar
        </button>
      </div>
    );

  const graded = result && result.total > 0;
  const allRight = graded && result.correct === result.total;

  return (
    <div className="screen player">
      <header className="player-top">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Sair da lição">
          ✕
        </button>
        <div className="progress">
          <div style={{ width: `${(idx / lesson.activities.length) * 100}%` }} />
        </div>
        <span className="small">
          {idx + 1}/{lesson.activities.length}
        </span>
      </header>
      <main className="stage" key={a.id}>
        <ActivityView a={a} onResult={onResult} locked={Boolean(result)} />
      </main>
      {result && (
        <footer className={`feedback ${graded ? (allRight ? "ok" : result.correct ? "mid" : "bad") : ""}`}>
          <div>
            {graded && <strong>{allRight ? "Isso mesmo!" : result.correct ? `${result.correct}/${result.total}` : "Ainda não."}</strong>}
            {result.feedback && <p>{result.feedback}</p>}
          </div>
          <button type="button" className="primary" onClick={next} autoFocus>
            Continuar
          </button>
        </footer>
      )}
    </div>
  );
}
