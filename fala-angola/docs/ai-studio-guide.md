# Continuing in Google AI Studio

The prototype in this folder is a standard React + TypeScript + Vite app, the same kind of app AI Studio's **Build** mode produces. So AI Studio can pick it up and add the Gemini features on top. AI Studio's menus change often, so if a button below has a different name, look for the closest match.

## 1. Bring the app into AI Studio

1. On GitHub, download this folder (`fala-angola/`) as a zip.
2. In AI Studio, open **Build** and start a new app. Upload the zip, or paste the files in, using whichever import option AI Studio shows.
3. Ask it: *"Run this app as-is. Don't change the design or content."* Check that Week 1 plays.
4. Export back to GitHub after every working session, so nothing lives only in AI Studio.

## 2. Features to add with the AI Studio credits, in this order

| # | Feature | Gemini capability | Where it plugs in |
|---|---|---|---|
| 1 | Live voice conversation with Dona Rosa and Isa | Gemini Live API (voice in, voice out) | A new activity type next to `branch` in `src/components/activities/Activities.tsx` |
| 2 | Feedback on the learner's writing | Gemini text model | `WriteView`: send the text, show the reply |
| 3 | Pronunciation feedback | Gemini audio understanding | `RepeatView`: send the learner's recording and the target phrase |
| 4 | Image replacements | Gemini image generation | `public/images/`, using the style prompt below |
| 5 | Short opening scene for each week | Veo video | Day 1 `scene` activity |
| 6 | Fallback voice for phrases that haven't been recorded | Gemini text-to-speech | `src/engine/speech.ts`, before the browser voice |

Keep the API key out of the browser. Use AI Studio's built-in key handling or the Cloud Run deployment's environment settings.

## 3. Prompts to paste into AI Studio

### Role-play: Dona Rosa (Week 1, Day 4 live version)
```
You are Dona Rosa, a warm retired teacher in her 60s who lives in Luanda, Angola.
You are talking to a foreign beginner (CEFR A1) who has just moved into your building.
Speak ONLY Angolan Portuguese (European spelling: telemóvel, autocarro, "estou a fazer").
Use only these structures: verb ser (sou, és, é, somos, são), greetings (bom dia,
boa tarde, boa noite, tchau, até amanhã), numbers 0-10, days of the week.
Sentences of 3 to 8 words. Speak slowly. One question at a time.
If the learner makes a mistake, repeat their sentence correctly in a natural way
("Ah, você é estudante!") and keep the conversation going. Never lecture.
If the learner uses "tu" with you, smile and say "Pode tratar-me por Dona Rosa."
After 5 exchanges, say goodnight and end with: "Boa noite! Até amanhã!"
```

### Writing feedback (Week 1)
```
You are a kind Portuguese teacher in Luanda. The learner is A1 and wrote this
self-introduction: <TEXT>. Reply in English, max 60 words:
1) one thing they did well, 2) at most two corrections, showing the corrected
Portuguese sentence, 3) one new phrase they could add. Use Angolan / European
Portuguese norms. Do not rewrite the whole text.
```

### Pronunciation feedback
```
The target phrase is "<PHRASE>". Listen to the learner's recording. In English,
max 40 words: say whether the key sound (<FOCUS>, e.g. the nasal "ão") was
produced, and give one physical tip (lips, nose, tongue). Be encouraging.
Accept Angolan pronunciation as the model, not Brazilian.
```

### Image style (use for every generated picture so they match)
```
Editorial photograph, Luanda, Angola, present day. Warm late-afternoon light,
deep shadows, rich terracotta, gold and red tones. Real Angolan people, adults
and teenagers, natural expressions, contemporary clothing, some samakaka cloth
details. Shallow depth of field, 35mm look. No text, no logos, no cartoon style,
no stock-photo smiles.
```
Example subjects: *the Roque Santeiro market at 7am with a zungueira arranging mangoes*; *a blue-and-white candongueiro at a busy paragem*; *an older woman at her apartment door at night, warm light from inside*.

## 4. Publishing

- Use AI Studio's **Deploy** (Cloud Run) to get a public link.
- Add **Firebase** (the free tier is enough to start) for sign-in and for saving progress online. Today, progress is saved on the device in `src/engine/store.ts`. Only the `load` and `set` functions there need to change.
- Share the link on WhatsApp. Learners open it on their phone and tap "Add to Home screen". The app already has an icon and a full-screen mode.
