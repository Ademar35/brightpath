import { useMemo, useState } from "react";
import { weeks } from "../content/book1";
import { sfx } from "../engine/sound";
import { speak } from "../engine/speech";
import { dueCards, reviewCard } from "../engine/store";
import { shuffle } from "./activities/shared";

const phrases = new Map(weeks.flatMap((w) => w.phrases).map((p) => [p.id, p]));

// Spaced review: see the English, recall the Portuguese, then check yourself.
export function Review({ onExit }: { onExit: () => void }) {
  const queue = useMemo(() => shuffle(dueCards()).filter((id) => phrases.has(id)), []);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knew, setKnew] = useState(0);
  const p = phrases.get(queue[i]);

  const answer = (k: boolean) => {
    reviewCard(queue[i], k);
    (k ? sfx.coin : sfx.tap)();
    if (k) setKnew(knew + 1);
    setFlipped(false);
    setI(i + 1);
  };

  return (
    <div className="screen player">
      <header className="player-top">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Sair">
          ✕
        </button>
        <div className="progress">
          <div style={{ width: `${queue.length ? (i / queue.length) * 100 : 100}%` }} />
        </div>
        <span className="small">Revisão</span>
      </header>
      <main className="stage">
        {!p ? (
          <div className="results">
            <p className="eyebrow">Revisão feita</p>
            <h1>
              {knew}/{queue.length}
            </h1>
            <p className="lead">Phrases you knew come back later. The ones you missed come back tomorrow.</p>
            <button type="button" className="primary wide" onClick={onExit}>
              Continuar
            </button>
          </div>
        ) : (
          <div className="flash">
            <p className="eyebrow">How do you say…</p>
            <h2 className="sentence">{p.en}</h2>
            {flipped ? (
              <>
                <p className="answer">{p.pt}</p>
                <div className="row">
                  <button type="button" className="ghost" onClick={() => answer(false)}>
                    Não sabia
                  </button>
                  <button type="button" className="primary" onClick={() => answer(true)}>
                    Sabia!
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="primary wide"
                onClick={() => {
                  setFlipped(true);
                  speak(p.pt);
                }}
              >
                Mostrar
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
