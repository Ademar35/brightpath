import { useEffect, useMemo, useRef, useState } from "react";
import type { Activity } from "../../content/types";
import { sfx, startBeat, stopBeat } from "../../engine/sound";
import { speak } from "../../engine/speech";
import { type ActivityProps, shuffle } from "../activities/shared";

type HoraCerta = Extract<Activity, { game: "hora-certa" }>;
type Pares = Extract<Activity, { game: "pares" }>;

const ROUND_MS = 6000;

// Greeting by time of day, against the clock, to a kuduro beat.
export function HoraCertaGame({ activity: a, onResult }: ActivityProps<HoraCerta>) {
  const rounds = useMemo(() => shuffle(a.rounds), [a.id]);
  const [i, setI] = useState(-1);
  const [picked, setPicked] = useState<string | null>(null);
  const [left, setLeft] = useState(ROUND_MS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [points, setPoints] = useState(0);
  const timer = useRef<number | null>(null);
  const r = rounds[i];

  useEffect(() => () => stopBeat(), []);

  useEffect(() => {
    if (i < 0 || i >= rounds.length || picked !== null) return;
    const started = Date.now();
    timer.current = window.setInterval(() => {
      const remaining = ROUND_MS - (Date.now() - started);
      setLeft(remaining);
      if (remaining <= 0) answer(null);
    }, 100);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [i, picked]); // eslint-disable-line react-hooks/exhaustive-deps

  function answer(o: string | null) {
    if (timer.current) window.clearInterval(timer.current);
    setPicked(o ?? "");
    const ok = o === r.answer;
    speak(r.answer);
    if (ok) {
      sfx.correct();
      setScore((s) => s + 1);
      setCombo((c) => c + 1);
      setPoints((p) => p + 100 + Math.round(left / 60) * (1 + combo));
    } else {
      sfx.wrong();
      setCombo(0);
    }
    setTimeout(() => {
      if (i + 1 >= rounds.length) {
        stopBeat();
        sfx.win();
        onResult({ correct: score + (ok ? 1 : 0), total: rounds.length });
        setI(rounds.length);
      } else {
        setPicked(null);
        setLeft(ROUND_MS);
        setI(i + 1);
      }
    }, 1100);
  }

  if (i < 0)
    return (
      <div className="game-intro">
        <p className="eyebrow">Jogo</p>
        <h2>Hora Certa</h2>
        <p className="lead">A time and a place appear. Tap the right greeting before the bar runs out. Answer fast and keep a streak going for a combo bonus.</p>
        <button type="button" className="primary wide" onClick={() => (startBeat(), setI(0))}>
          Começar
        </button>
      </div>
    );

  if (i >= rounds.length)
    return (
      <div className="game-intro">
        <h2>{points} pts</h2>
        <p className="lead">
          {score} / {rounds.length} certas
        </p>
      </div>
    );

  return (
    <div className="hora">
      <div className="hora-top">
        <span>
          {i + 1}/{rounds.length}
        </span>
        <span className="combo">{combo > 1 ? `Combo x${combo}` : ""}</span>
        <span>{points} pts</span>
      </div>
      <div className="timebar">
        <div style={{ width: `${Math.max(left, 0) / (ROUND_MS / 100)}%` }} />
      </div>
      <div className="clock">{r.time}</div>
      <p className="lead center">{r.scene}</p>
      <div className="options">
        {r.options.map((o) => (
          <button
            type="button"
            key={o}
            className={`option big ${picked === null ? "" : o === r.answer ? "ok" : o === picked ? "bad" : "dim"}`}
            disabled={picked !== null}
            onClick={() => answer(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// Memory pairs: digit to word. Six pairs per round fit a phone screen.
export function ParesGame({ activity: a, onResult }: ActivityProps<Pares>) {
  const cards = useMemo(() => {
    const pairs = shuffle(a.pairs).slice(0, 6);
    return shuffle(pairs.flatMap(([n, w], k) => [{ k, face: n }, { k, face: w }]));
  }, [a.id]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);

  const flip = (idx: number) => {
    if (open.length === 2 || open.includes(idx) || found.includes(cards[idx].k)) return;
    sfx.tap();
    if (!/^\d+$/.test(cards[idx].face)) speak(cards[idx].face);
    const next = [...open, idx];
    setOpen(next);
    if (next.length < 2) return;
    const [x, y] = next;
    if (cards[x].k === cards[y].k) {
      setTimeout(() => {
        sfx.coin();
        const f = [...found, cards[x].k];
        setFound(f);
        setOpen([]);
        if (f.length === cards.length / 2) {
          sfx.win();
          onResult({ correct: Math.max(f.length - Math.floor(misses / 3), 1), total: f.length });
        }
      }, 350);
    } else {
      setMisses(misses + 1);
      setTimeout(() => setOpen([]), 800);
    }
  };

  return (
    <div>
      <p className="eyebrow">Jogo · Pares</p>
      <h2 className="question">Match each number to its word.</h2>
      <div className="pares">
        {cards.map((c, idx) => {
          const shown = open.includes(idx) || found.includes(c.k);
          return (
            <button
              type="button"
              key={idx}
              className={`tile ${shown ? "up" : ""} ${found.includes(c.k) ? "ok" : ""}`}
              onClick={() => flip(idx)}
              aria-label={shown ? c.face : "Hidden card"}
            >
              {shown ? c.face : ""}
            </button>
          );
        })}
      </div>
      <p className="hint center">Misses: {misses}</p>
    </div>
  );
}
