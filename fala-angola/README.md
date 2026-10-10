# Fala Angola

A game-like Portuguese course for foreigners living in Angola, built from the booklet **"Português Inicial para Estrangeiros (A1)"** by Professora Lisandra Almeida.

Each booklet unit becomes one week with five short daily lessons:

| Day | Type | What happens |
|---|---|---|
| 1 | Cena | A guess-first question, then a short scene in Luanda |
| 2 | Frases | Grammar cards with audio, gap-fills, and pronunciation with recording |
| 3 | Jogos | Timed games (*Hora Certa*, *Pares*), word order, matching |
| 4 | Conversa | A branching conversation with a character (Dona Rosa) |
| 5 | Missão | A mixed test set across one day in the city. 70% passes the week |

Every finished lesson adds its phrases to a **Revisão** deck, which brings each phrase back at growing intervals (1, 2, 4, 7, 15 and 30 days). Learners earn XP and Kz and keep a daily streak, with one free missed day for every 7-day streak. Ranks go Turista → Visitante → Morador → Kota → Mais Velho.

**Status:** Week 1 (Unit 1) is fully playable. Weeks 2 to 9 are mapped out, and 10 to 12 are waiting for the teacher's content.

## Run it

```bash
cd fala-angola
npm install
npm run dev
```
Then open the link it prints. To build the deployable version: `npm run build` (the output goes to `dist/`).

## Where things live

| Path | What |
|---|---|
| `src/content/book1/week1.json` | All of Week 1's lessons. Edit the text here; no coding needed |
| `src/content/book1/index.ts` | The 12-week season map |
| `src/content/types.ts` | The 11 activity types the content can use |
| `src/engine/store.ts` | Progress, XP, Kz, streak and the review schedule (saved on the device) |
| `src/engine/sound.ts` | Sound effects and the game beat, all generated in code |
| `src/engine/speech.ts` | Plays teacher recordings from `public/audio/`, or a browser voice as a stand-in |
| `docs/booklet-analysis.md` | Review of the booklet: gaps, corrections, Unit 1 answer key |
| `docs/ai-studio-guide.md` | How to keep building in Google AI Studio, with ready-made prompts |
| `docs/assets.md` | Recordings, images and music still needed |

## Adding Week 2

Copy `week1.json` to `week2.json`, rewrite its content from Unit 2, add it to the `weeks` list in `src/content/book1/index.ts`, and set its `status` to `"ready"`. A new game type (e.g. *Liga-me*) means one new component in `src/components/games/`.

## Still needed

1. **The full booklet PDF, to review the images and read Units 10 to 12.** The Drive copy is 10.9 MB, over the connector's 10 MB limit. Compress it below 10 MB, or upload it to this repo.
2. **Angolan voice recordings** for the Week 1 phrases (list in `docs/assets.md`).
3. **The teacher's sign-off** on every Portuguese sentence and on the corrections in `docs/booklet-analysis.md`.
