import { useEffect, useMemo, useState } from "react";
import { book, season, weeks } from "./content/book1";
import type { Lesson, Week } from "./content/types";
import { LessonPlayer } from "./components/LessonPlayer";
import { Review } from "./components/Review";
import { setMuted, sfx } from "./engine/sound";
import { dueCards, lessonUnlocked, rankFor, setName, startWeek, toggleMute, useProgress } from "./engine/store";

const KIND_LABEL: Record<Lesson["kind"], string> = {
  cena: "Cena",
  frases: "Frases",
  jogos: "Jogos",
  conversa: "Conversa",
  missao: "Missão",
};

type Screen = { name: "home" } | { name: "lesson"; week: Week; lesson: Lesson } | { name: "review" };

export default function App() {
  const p = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  useEffect(() => setMuted(p.muted), [p.muted]);

  if (!p.name) return <Welcome />;
  if (screen.name === "lesson")
    return <LessonPlayer week={screen.week} lesson={screen.lesson} onExit={() => setScreen({ name: "home" })} />;
  if (screen.name === "review") return <Review onExit={() => setScreen({ name: "home" })} />;
  return (
    <Home
      onLesson={(week, lesson) => {
        startWeek(week.id);
        sfx.tap();
        setScreen({ name: "lesson", week, lesson });
      }}
      onReview={() => setScreen({ name: "review" })}
    />
  );
}

function Welcome() {
  const [v, setV] = useState("");
  return (
    <div className="screen welcome">
      <div className="welcome-art" aria-hidden>
        <div className="sun" />
        <div className="skyline" />
        <div className="pano" />
      </div>
      <p className="eyebrow">{book.level} · {book.season}</p>
      <h1>
        Fala
        <br />
        Angola
      </h1>
      <p className="lead">Portuguese for life in Luanda. Fifteen minutes a day. Real situations, real Angolan Portuguese.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (v.trim()) {
            sfx.coin();
            setName(v.trim());
          }
        }}
      >
        <label htmlFor="name">Como te chamas? (What's your name?)</label>
        <div className="type-row">
          <input id="name" value={v} onChange={(e) => setV(e.target.value)} placeholder="Eu sou…" autoComplete="given-name" />
          <button type="submit" className="primary" disabled={!v.trim()}>
            Começar
          </button>
        </div>
      </form>
      <p className="credit">Based on the course book by {book.author}</p>
    </div>
  );
}

function Home({ onLesson, onReview }: { onLesson: (w: Week, l: Lesson) => void; onReview: () => void }) {
  const p = useProgress();
  const { rank, next, pct } = rankFor(p.xp);
  const due = useMemo(() => dueCards().length, [p.cards]);
  const week = weeks[0];
  const ids = week.lessons.map((l) => l.id);
  const doneCount = ids.filter((id) => p.lessons[id]).length;
  const nextLesson = week.lessons.find((l, i) => !p.lessons[l.id] && lessonUnlocked(ids, i));

  return (
    <div className="screen home">
      <header className="hud">
        <div className="rank">
          <span className="small">Olá, {p.name}</span>
          <strong>{rank.name}</strong>
          <div className="xpbar" title={next ? `${next.xp - p.xp} XP to ${next.name}` : "Top rank"}>
            <div style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        <div className="stats">
          <span title="Day streak">🔥 {p.streak}</span>
          <span title="Kwanzas earned">{p.kz} Kz</span>
          <span title="Experience">{p.xp} XP</span>
          <button type="button" className="icon-btn" onClick={toggleMute} aria-label={p.muted ? "Ligar som" : "Desligar som"}>
            {p.muted ? "🔇" : "🔊"}
          </button>
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">
          Semana {week.number} · {week.unit}
        </p>
        <h1>{week.title}</h1>
        <p className="lead">{week.tagline}</p>
        <div className="tags">
          {[...week.grammar, ...week.vocabulary].map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        {nextLesson && (
          <button type="button" className="primary wide" onClick={() => onLesson(week, nextLesson)}>
            {doneCount === 0 ? "Começar" : "Continuar"}: Dia {nextLesson.day} · {nextLesson.title}
          </button>
        )}
      </section>

      <section>
        <h2 className="section">Esta semana</h2>
        <ol className="days">
          {week.lessons.map((l, i) => {
            const rec = p.lessons[l.id];
            const open = lessonUnlocked(ids, i);
            return (
              <li key={l.id}>
                <button type="button" className={`day ${rec ? "done" : ""} ${open ? "" : "locked"}`} disabled={!open} onClick={() => onLesson(week, l)}>
                  <span className="num">{rec ? "✓" : l.day}</span>
                  <span className="body">
                    <span className="kind">
                      {KIND_LABEL[l.kind]} · {l.minutes} min
                    </span>
                    <strong>{l.title}</strong>
                    <span className="small">{l.subtitle}</span>
                  </span>
                  {rec && <span className="score">{Math.round(rec.score * 100)}%</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <button type="button" className={`review-btn ${due ? "" : "quiet"}`} onClick={onReview} disabled={!Object.keys(p.cards).length}>
        <strong>Revisão</strong>
        <span>{Object.keys(p.cards).length ? (due ? `${due} phrases ready to review` : "All caught up for today") : "Finish a lesson to fill your deck"}</span>
      </button>

      <section>
        <h2 className="section">Temporada 1: Chegada</h2>
        <ol className="season">
          {season.map((w) => (
            <li key={w.number} className={`week-stub ${w.status}`}>
              <span className="num">{String(w.number).padStart(2, "0")}</span>
              <span className="body">
                <strong>{w.title}</strong>
                <span className="small">
                  {w.status === "ready" ? `${doneCount}/5 dias` : w.status === "planned" ? `${w.game} · ${w.mission}` : "Em breve"}
                </span>
              </span>
              <span className="lock">{w.status === "ready" ? "" : "🔒"}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
