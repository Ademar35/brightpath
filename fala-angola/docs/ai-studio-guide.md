# Continuing in Google AI Studio

The prototype in this folder is a standard React + TypeScript + Vite app, the same kind of app AI Studio's **Build** mode produces. So AI Studio can pick it up and add the Gemini features on top. AI Studio's menus change often, so if a button below has a different name, look for the closest match.

## 1. Bring the app into AI Studio

1. On GitHub, download this folder (`fala-angola/`) as a zip.
2. In AI Studio, open **Build** and start a new app. Upload the zip, or paste the files in, using whichever import option AI Studio shows.
3. Ask it: *"Run this app as-is. Don't change the design or content."* Check that Week 1 plays.
4. Export back to GitHub after every working session, so nothing lives only in AI Studio.

## 2. Give AI Studio the booklet, then paste the master prompt

1. In the same AI Studio chat, attach the booklet PDF (`Booklet - INICIANTE.pdf`). If AI Studio rejects it as too large, compress it first (for example at ilovepdf.com/compress_pdf) and attach the smaller copy.
2. Paste the master prompt below. It tells Gemini to treat the booklet as the source for every lesson, and to decide by itself when a lesson needs an image or a video.
3. Build one week at a time: *"Build Week 2 from Unit 2 using the master prompt."* Check the week in the preview before asking for the next one.

### Master prompt
```
You are building "Fala Angola", a game-like Portuguese course for foreigners in
Angola. This app already has Week 1 working. Keep its design, engine and file
structure exactly as they are.

SOURCE OF TRUTH
- The attached PDF is the course book "Português Inicial para Estrangeiros (A1)"
  by Professora Lisandra Almeida. Read the whole booklet before you change anything.
- Each booklet unit becomes one week. Build week N only from unit N: its grammar,
  vocabulary, dialogues, characters (Isa, Márcio, Paulo, Sofia, Carla...) and
  exercises. Do not teach grammar the unit has not reached yet.
- Use Angolan / European Portuguese norms (telemóvel, autocarro, pequeno-almoço,
  "estou a fazer"), never Brazilian forms.
- Fix the typos listed in docs/booklet-analysis.md and keep everything else the
  booklet says.
- Write each week as src/content/book1/weekN.json in the same schema as
  week1.json: 5 days (cena, frases, jogos, conversa, missao), then register it in
  src/content/book1/index.ts and set its status to "ready".

IMAGES: add one when the learner needs to SEE something to learn it
Add an image when:
- the lesson is a Day 1 scene (one opening image per week, always);
- the words are concrete and visual: food, drinks, clothes, colours, transport,
  family members, body parts, places in a city;
- the booklet exercise depends on a picture: "Escreva o nome de cada imagem",
  "Associe as palavras às imagens", "Observe o mapa", "Observe a imagem",
  "Substitua a imagem pela palavra", "Identifique os continentes";
- a culture point is easier to show than tell (a candongueiro, a zungueira,
  a dish like funje or muamba).
Do NOT add an image to grammar tables, conjugation drills, abstract words,
or any screen that already works well with text and audio.
How:
- First look at the booklet's own picture for that spot. Reuse it if it is set in
  Angola, clear at phone size and adult in tone. Otherwise generate a new one.
- Every generated image uses the "Image style" prompt in docs/ai-studio-guide.md.
- Never put words or numbers inside a generated image; labels belong in the app.
- Save as public/images/weekN/<activity-id>.webp, max 1280 px wide, under 200 KB,
  and give it English alt text.

VIDEO: add one only when movement or a real place matters
Add a video for:
- the Day 1 opening scene of each week (sets the place: the airport, the market,
  a restaurant on the Ilha, a candongueiro stop);
- the setting of the Day 4 conversation, if a still image is not enough;
- the Day 5 mission intro, as a 5 to 8 second teaser.
Do NOT use video to teach grammar, show text or replace audio.
How:
- Generate with Veo using the same style as the images. 8 to 20 seconds, no
  speech and no on-screen text: the voices come from the teacher's recordings.
- Export MP4 (H.264), 720p, under 3 MB, plus a poster image. Save to
  public/video/weekN/<activity-id>.mp4.
- Never autoplay with sound, always let the learner skip, and make the lesson
  still work if the video fails to load on weak mobile data.

BUDGET
- At most 1 to 2 videos and 4 to 8 images per week. Ask me before going over.
- List every image and video you made at the end of each week, with where it is used.

CODE CHANGES ALLOWED FOR MEDIA
- Add an optional "image": { "src": string, "alt": string } field to the card,
  scene, choice and match activity types in src/content/types.ts, and show it
  in the matching components.
- Add a "video" activity type { "type": "video", "id", "src", "poster", "caption" }
  with its own component and a "Skip" button.
- Change nothing else in the engine without asking.
```

### Booklet pages that already call for pictures

These come from the booklet text. Gemini should start here when it decides where images go.

| Week | Booklet spot | What to show |
|---|---|---|
| 3 | Unit 3, "Identifique os continentes" (p.23) | A simple world map with the continents |
| 4 | Unit 4, ex. 7 "Substitua a imagem pela palavra" (p.41) | Single food items: maçã, pão, arroz, peixe, água |
| 6 | Unit 6, family picture (p.48), used again in ex. 4 | An Angolan family of three generations |
| 7 | Unit 7, "Vocabulário: Roupas e Objetos" and "Escreva o nome de cada imagem" (pp.56-57) | 10 clothing items and objects, one per image |
| 8 | Unit 8, city map (p.64) for the preposition exercise | A clear map: farmácia, banco, escola, hospital, hotel, mercado, paragem de táxi |
| 8 | Unit 8, "Associe as palavras às imagens" (p.64) | autocarro, táxi, comboio, avião, bicicleta, mota |
| 9 | Unit 9, parts of the body (p.74) | A body diagram with no labels; the app adds the labels |

## 3. Features to add with the AI Studio credits, in this order

| # | Feature | Gemini capability | Where it plugs in |
|---|---|---|---|
| 1 | Live voice conversation with Dona Rosa and Isa | Gemini Live API (voice in, voice out) | A new activity type next to `branch` in `src/components/activities/Activities.tsx` |
| 2 | Feedback on the learner's writing | Gemini text model | `WriteView`: send the text, show the reply |
| 3 | Pronunciation feedback | Gemini audio understanding | `RepeatView`: send the learner's recording and the target phrase |
| 4 | Image replacements | Gemini image generation | `public/images/`, using the style prompt below |
| 5 | Short opening scene for each week | Veo video | Day 1 `scene` activity |
| 6 | Fallback voice for phrases that haven't been recorded | Gemini text-to-speech | `src/engine/speech.ts`, before the browser voice |

Keep the API key out of the browser. Use AI Studio's built-in key handling or the Cloud Run deployment's environment settings.

## 4. Prompts to paste into AI Studio

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

## 5. Publishing

- Use AI Studio's **Deploy** (Cloud Run) to get a public link.
- Add **Firebase** (the free tier is enough to start) for sign-in and for saving progress online. Today, progress is saved on the device in `src/engine/store.ts`. Only the `load` and `set` functions there need to change.
- Share the link on WhatsApp. Learners open it on their phone and tap "Add to Home screen". The app already has an icon and a full-screen mode.
