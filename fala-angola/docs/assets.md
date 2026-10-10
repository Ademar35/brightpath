# What's needed: recordings, images, sounds

## 1. Voice recordings (most important)

Browser voices sound Brazilian or Portuguese, not Angolan. Have the teacher (or another Angolan speaker) record each phrase below on a phone, in a quiet room. Save each one as an MP3 in `public/audio/`, using the file name shown, and the app plays it automatically instead of the browser voice.

File names are the phrase in lower case, with no accents and with dashes in place of spaces and punctuation. For example, "Bom dia!" becomes `bom-dia.mp3`.

**Week 1 (31 clips, about 10 minutes of recording):**

| Phrase | File |
|---|---|
| Bom dia | bom-dia.mp3 |
| Muito prazer! | muito-prazer.mp3 |
| Eu sou estudante. | eu-sou-estudante.mp3 |
| Nós somos vizinhos. | nos-somos-vizinhos.mp3 |
| pão, mão, irmão | pao-mao-irmao.mp3 |
| O meu irmão compra pão na estação. | o-meu-irmao-compra-pao-na-estacao.mp3 |
| Boa noite, Dona Rosa! Até amanhã! | boa-noite-dona-rosa-ate-amanha.mp3 |
| Olá! Bom dia! Eu sou a Isa. | ola-bom-dia-eu-sou-a-isa.mp3 |
| Bom dia! Eu sou o Tom. | bom-dia-eu-sou-o-tom.mp3 |
| Muito prazer, Tom! Eu sou professora. Sou de Luanda. | muito-prazer-tom-eu-sou-professora-sou-de-luanda.mp3 |
| O prazer é todo meu. Eu sou estudante de português. | o-prazer-e-todo-meu-eu-sou-estudante-de-portugues.mp3 |
| Hoje é segunda-feira. Bem-vindo a Angola! | hoje-e-segunda-feira-bem-vindo-a-angola.mp3 |
| Boa noite! Tudo bem? | boa-noite-tudo-bem.mp3 |
| Você é novo no bairro? | voce-e-novo-no-bairro.mp3 |
| Eu sou a Rosa. Sou professora reformada. | eu-sou-a-rosa-sou-professora-reformada.mp3 |
| Hoje é sexta-feira. Amanhã é...? | hoje-e-sexta-feira-amanha-e.mp3 |
| Bem, vou dormir. Boa noite! | bem-vou-dormir-boa-noite.mp3 |
| Boa tarde / Boa noite / Até amanhã / Tchau, até logo | one file each |
| um, dois, três ... dez | one file each (um.mp3, dois.mp3, ...) |
| Eu sou, Tu és, Você é, Ele, Ela é, Nós somos, Vocês são, Eles, Elas são | eu-sou.mp3, tu-es.mp3, ... |

To check a file name, open the app, tap ▶ on the phrase, and look in the browser's network tab: the app asks for `audio/<name>.mp3` first.

## 2. Images

The booklet's images couldn't be reviewed yet (see the README). When they can, each one gets a keep / fix / replace decision using one test: **Is it set in Angola, is it clear on a phone screen, and is the tone adult?**

- **Keep:** the cover illustration (learners with the Luanda skyline and samakaka border). It sets the app's look.
- **Generate new images** with the style prompt in `ai-studio-guide.md`, at least one per week for the Day 1 scene:
  1. Arrivals hall, Luanda airport, someone holding a name sign (Week 1)
  2. Two people swapping phone numbers outside a café (Week 2)
  3. Passport control desk (Week 3)
  4. Lunch table on the Ilha: muamba, funje, a Cuca beer, a sumo (Week 4)
  5. Early morning in a Luanda apartment, coffee and a phone alarm (Week 5)
  6. A family Sunday lunch, three generations (Week 6)
  7. A clothes stall at the market, price tags in Kz (Week 7)
  8. A busy candongueiro stop, someone looking at a map (Week 8)
  9. A pharmacy counter, a centro de saúde entrance (Week 9)

## 3. Sounds

- **Sound effects:** done. They're generated in code (`src/engine/sound.ts`), with no files needed.
- **Game beat:** a simple kuduro-style loop is generated in code for the games. A real track from a local producer would be a big upgrade. Ask for 3 loops of 60 to 90 seconds (kuduro, semba, kizomba) with full rights to use them in the app.
- **City ambience (optional):** 30-second recordings of a market, traffic and the sea at the Ilha, for the Day 1 scenes.
