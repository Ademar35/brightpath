import { useEffect, useMemo, useState } from "react";
import type { Activity } from "../../content/types";
import { sfx } from "../../engine/sound";
import { record, speak } from "../../engine/speech";
import { type ActivityProps, plain, shuffle, SpeakButton } from "./shared";

type Of<T extends Activity["type"]> = Extract<Activity, { type: T }>;

export function CardView({ activity: a, onResult }: ActivityProps<Of<"card">>) {
  useEffect(() => onResult({ correct: 0, total: 0 }), [a.id]);
  return (
    <div className="card-view">
      <h2>{a.title}</h2>
      {a.body && <p className="lead">{a.body}</p>}
      {a.rows && (
        <table className="grid-table">
          <tbody>
            {a.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j === 0 ? "pt" : ""}>
                    {c}
                    {j === 0 && <SpeakButton text={a.speakPairs ? `${c.replace(" / ", ", ")} ${r[1]}` : c.replace(" / ", ", ")} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {a.note && <p className="note">{a.note}</p>}
    </div>
  );
}

export function SceneView({ activity: a, onResult }: ActivityProps<Of<"scene">>) {
  const [shown, setShown] = useState(1);
  const [showEn, setShowEn] = useState(false);
  const done = shown >= a.lines.length;
  useEffect(() => {
    speak(a.lines[shown - 1].pt);
    if (done) onResult({ correct: 0, total: 0 });
  }, [shown]);
  return (
    <div className="scene">
      <p className="eyebrow">{a.title}</p>
      <p className="setting">{a.setting}</p>
      <div className="chat">
        {a.lines.slice(0, shown).map((l, i) => (
          <div key={i} className={`bubble ${l.who === "Você" ? "me" : ""}`}>
            <span className="who">{l.who}</span>
            <span className="pt">{l.pt}</span>
            {showEn && <span className="en">{l.en}</span>}
            <SpeakButton text={l.pt} />
          </div>
        ))}
      </div>
      <div className="row">
        <button type="button" className="ghost" onClick={() => setShowEn(!showEn)}>
          {showEn ? "Hide English" : "Show English"}
        </button>
        {!done && (
          <button type="button" className="primary" onClick={() => (sfx.tap(), setShown(shown + 1))}>
            Next line
          </button>
        )}
      </div>
    </div>
  );
}

function Options({
  options,
  answer,
  onPick,
  locked,
}: {
  options: string[];
  answer: string;
  onPick: (o: string) => void;
  locked: boolean;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="options">
      {options.map((o) => {
        const state = picked === null ? "" : o === answer ? "ok" : o === picked ? "bad" : "dim";
        return (
          <button
            type="button"
            key={o}
            className={`option ${state}`}
            disabled={locked || picked !== null}
            onClick={() => {
              setPicked(o);
              onPick(o);
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function ChoiceView({ activity: a, onResult, locked }: ActivityProps<Of<"choice">>) {
  return (
    <div>
      <h2 className="question">{a.question}</h2>
      <Options
        options={a.options}
        answer={a.options[a.answer]}
        locked={locked}
        onPick={(o) => {
          const ok = o === a.options[a.answer];
          if (a.say) speak(a.say);
          onResult({ correct: ok ? 1 : 0, total: 1, feedback: a.explain ?? (ok ? undefined : `Answer: ${a.options[a.answer]}`) });
        }}
      />
    </div>
  );
}

export function GapView({ activity: a, onResult, locked }: ActivityProps<Of<"gap">>) {
  const [fill, setFill] = useState<string | null>(null);
  const full = `${a.before} ${a.answer} ${a.after}`.trim().replace(/\s+([.?!,])/g, "$1");
  const spoken = full.match(/"([^"]+)"?/)?.[1] ?? full;
  return (
    <div>
      <p className="eyebrow">Complete</p>
      <h2 className="sentence">
        {a.before} <span className={`blank ${fill ? (fill === a.answer ? "ok" : "bad") : ""}`}>{fill ?? "____"}</span> {a.after}
      </h2>
      {a.en && fill && <p className="en">{a.en}</p>}
      <Options
        options={a.options}
        answer={a.answer}
        locked={locked}
        onPick={(o) => {
          setFill(o);
          speak(spoken);
          onResult({ correct: o === a.answer ? 1 : 0, total: 1, feedback: o === a.answer ? undefined : full });
        }}
      />
    </div>
  );
}

export function TypeView({ activity: a, onResult, locked }: ActivityProps<Of<"type">>) {
  const [v, setV] = useState("");
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (!v.trim() || sent) return;
    setSent(true);
    const exact = a.answers.some((x) => x.toLowerCase() === v.trim().toLowerCase());
    const close = a.answers.some((x) => plain(x) === plain(v));
    onResult({
      correct: exact || close ? 1 : 0,
      total: 1,
      feedback: exact ? undefined : close ? `Almost: watch the accent. ${a.answers[0]}` : `Answer: ${a.answers[0]}`,
    });
  };
  return (
    <div>
      <p className="eyebrow">Write it</p>
      <h2 className="question">{a.prompt}</h2>
      <form onSubmit={(e) => (e.preventDefault(), submit())} className="type-row">
        <input value={v} onChange={(e) => setV(e.target.value)} disabled={locked || sent} autoFocus aria-label="Your answer" autoCapitalize="none" />
        <button type="submit" className="primary" disabled={locked || sent || !v.trim()}>
          Check
        </button>
      </form>
      <div className="accents">
        {["á", "à", "â", "ã", "ç", "é", "ê", "í", "ó", "ô", "õ", "ú"].map((c) => (
          <button type="button" key={c} className="chip" disabled={sent} onClick={() => setV(v + c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TrueFalseView({ activity: a, onResult, locked }: ActivityProps<Of<"truefalse">>) {
  return (
    <div>
      <p className="eyebrow">Verdadeiro ou falso?</p>
      <h2 className="question">
        {a.statement} <SpeakButton text={a.statement} />
      </h2>
      <Options
        options={["Verdadeiro", "Falso"]}
        answer={a.answer ? "Verdadeiro" : "Falso"}
        locked={locked}
        onPick={(o) => {
          const ok = (o === "Verdadeiro") === a.answer;
          onResult({ correct: ok ? 1 : 0, total: 1, feedback: a.explain });
        }}
      />
    </div>
  );
}

export function OrderView({ activity: a, onResult, locked }: ActivityProps<Of<"order">>) {
  const pool = useMemo(() => shuffle(a.words.map((w, i) => ({ w, i }))), [a.id]);
  const [picked, setPicked] = useState<number[]>([]);
  const [sent, setSent] = useState(false);
  const sentence = picked.map((i) => a.words[i]).join(" ");
  const check = () => {
    setSent(true);
    const ok = plain(sentence) === plain(a.answer);
    const pretty = a.answer.charAt(0).toUpperCase() + a.answer.slice(1) + ".";
    speak(pretty);
    onResult({ correct: ok ? 1 : 0, total: 1, feedback: ok ? a.en : `${pretty} (${a.en ?? ""})` });
  };
  return (
    <div>
      <p className="eyebrow">Monta a frase</p>
      {a.en && <h2 className="question">{a.en}</h2>}
      <div className={`build ${sent ? (plain(sentence) === plain(a.answer) ? "ok" : "bad") : ""}`}>
        {picked.map((i) => (
          <button type="button" key={i} className="chip on" disabled={sent} onClick={() => setPicked(picked.filter((x) => x !== i))}>
            {a.words[i]}
          </button>
        ))}
        {!picked.length && <span className="hint">Tap the words in order</span>}
      </div>
      <div className="pool">
        {pool.map(({ w, i }) => (
          <button
            type="button"
            key={i}
            className="chip"
            disabled={picked.includes(i) || sent || locked}
            onClick={() => (sfx.tap(), setPicked([...picked, i]))}
          >
            {w}
          </button>
        ))}
      </div>
      {!sent && (
        <button type="button" className="primary wide" disabled={picked.length !== a.words.length} onClick={check}>
          Check
        </button>
      )}
    </div>
  );
}

export function MatchView({ activity: a, onResult }: ActivityProps<Of<"match">>) {
  const right = useMemo(() => shuffle(a.pairs.map((p) => p[1])), [a.id]);
  const [sel, setSel] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const pick = (r: string) => {
    if (!sel) return;
    const ok = a.pairs.find((p) => p[0] === sel)?.[1] === r;
    if (ok) {
      sfx.correct();
      speak(sel);
      const next = [...done, sel];
      setDone(next);
      setSel(null);
      if (next.length === a.pairs.length) {
        onResult({ correct: Math.max(a.pairs.length - misses, 0), total: a.pairs.length });
      }
    } else {
      sfx.wrong();
      setMisses(misses + 1);
      setFlash(r);
      setTimeout(() => setFlash(null), 400);
    }
  };
  return (
    <div>
      <p className="eyebrow">Liga</p>
      <h2 className="question">{a.title}</h2>
      <div className="match">
        <div>
          {a.pairs.map(([l]) => (
            <button
              type="button"
              key={l}
              className={`option ${done.includes(l) ? "ok" : sel === l ? "sel" : ""}`}
              disabled={done.includes(l)}
              onClick={() => (sfx.tap(), setSel(l))}
            >
              {l}
            </button>
          ))}
        </div>
        <div>
          {right.map((r) => {
            const used = a.pairs.some((p) => p[1] === r && done.includes(p[0]));
            return (
              <button
                type="button"
                key={r}
                className={`option ${used ? "ok" : flash === r ? "bad" : ""}`}
                disabled={used}
                onClick={() => pick(r)}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function RepeatView({ activity: a, onResult }: ActivityProps<Of<"repeat">>) {
  const [clip, setClip] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [noMic, setNoMic] = useState(false);
  useEffect(() => speak(a.pt), [a.id]);
  const go = async () => {
    setBusy(true);
    const url = await record(Math.min(2000 + a.pt.length * 90, 6000));
    setBusy(false);
    if (!url) {
      setNoMic(true);
      onResult({ correct: 0, total: 0, feedback: "No microphone? Say it out loud anyway. It still counts." });
      return;
    }
    setClip(url);
    onResult({ correct: 0, total: 0, feedback: "Compare: play Isa, then play yourself. Same rhythm?" });
  };
  return (
    <div className="repeat">
      <p className="eyebrow">Ouve e repete{a.focus ? ` · som ${a.focus}` : ""}</p>
      <h2 className="sentence">{a.pt}</h2>
      <p className="en">{a.en}</p>
      <div className="row center">
        <SpeakButton text={a.pt} />
        <button type="button" className={`mic ${busy ? "rec" : ""}`} onClick={go} disabled={busy}>
          {busy ? "A gravar…" : clip ? "Gravar outra vez" : "● Gravar"}
        </button>
        {clip && (
          <button type="button" className="ghost" onClick={() => new Audio(clip).play()}>
            ▶ Eu
          </button>
        )}
      </div>
      {!clip && !noMic && (
        <button type="button" className="link" onClick={() => onResult({ correct: 0, total: 0 })}>
          I can't speak now, skip
        </button>
      )}
    </div>
  );
}

export function WriteView({ activity: a, onResult }: ActivityProps<Of<"write">>) {
  const [v, setV] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div>
      <p className="eyebrow">Escreve</p>
      <h2 className="question">{a.prompt}</h2>
      <ul className="checklist">
        {a.checklist.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <textarea value={v} onChange={(e) => setV(e.target.value)} rows={4} disabled={sent} aria-label="Your text" />
      {!sent ? (
        <button
          type="button"
          className="primary wide"
          disabled={v.trim().split(/\s+/).length < 4}
          onClick={() => {
            setSent(true);
            onResult({ correct: 0, total: 0, feedback: `Model answer: ${a.model}` });
          }}
        >
          Done
        </button>
      ) : (
        <p className="note">Your teacher can review this in the live session. AI feedback arrives with the AI Studio version.</p>
      )}
    </div>
  );
}

export function BranchView({ activity: a, onResult }: ActivityProps<Of<"branch">>) {
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<{ who: string; text: string; ok?: boolean; note?: string }[]>([]);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const s = a.steps[step];
  useEffect(() => {
    if (!s) return;
    speak(s.npc);
    setLog((l) => (l.at(-1)?.text === s.npc ? l : [...l, { who: a.who, text: s.npc }]));
  }, [step]);
  const choose = (o: (typeof s.options)[number]) => {
    if (o.ok) {
      sfx.correct();
      const gained = tries === 0 ? 1 : 0;
      setLog((l) => [...l, { who: "Você", text: o.text, ok: true, note: o.feedback }]);
      setScore(score + gained);
      setTries(0);
      if (step + 1 >= a.steps.length) onResult({ correct: score + gained, total: a.steps.length });
      else setTimeout(() => setStep(step + 1), 900);
    } else {
      sfx.wrong();
      setTries(tries + 1);
      setLog((l) => [...l, { who: "Você", text: o.text, ok: false, note: o.feedback }]);
    }
  };
  return (
    <div className="scene">
      <p className="eyebrow">{a.title}</p>
      <div className="chat">
        {log.map((m, i) => (
          <div key={i} className={`bubble ${m.who === "Você" ? "me" : ""} ${m.ok === false ? "bad" : m.ok ? "ok" : ""}`}>
            <span className="who">{m.who}</span>
            <span className="pt">{m.text}</span>
            {m.note && <span className="en">{m.note}</span>}
          </div>
        ))}
      </div>
      {s && !log.at(-1)?.ok && (
        <div className="options">
          <p className="en">{s.en}</p>
          {s.options.map((o) => (
            <button type="button" key={o.text} className="option" onClick={() => choose(o)}>
              {o.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
