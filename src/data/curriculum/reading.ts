import { GenQuestion, SkillDef, mcq, shuffle } from "./types";

// Word banks by grade band: [word, synonym, antonym, decoys...]
type WordRow = { word: string; syn: string; ant: string; decoys: string[] };

const wordsByBand: Record<string, WordRow[]> = {
  early: [
    { word: "big", syn: "large", ant: "small", decoys: ["fast", "round"] },
    { word: "happy", syn: "glad", ant: "sad", decoys: ["tall", "loud"] },
    { word: "fast", syn: "quick", ant: "slow", decoys: ["soft", "wet"] },
    { word: "cold", syn: "chilly", ant: "hot", decoys: ["dark", "tiny"] },
    { word: "loud", syn: "noisy", ant: "quiet", decoys: ["green", "heavy"] },
    { word: "start", syn: "begin", ant: "stop", decoys: ["jump", "sleep"] },
    { word: "little", syn: "tiny", ant: "huge", decoys: ["angry", "shiny"] },
    { word: "smart", syn: "clever", ant: "silly", decoys: ["hungry", "sleepy"] },
    { word: "nice", syn: "kind", ant: "mean", decoys: ["blue", "old"] },
    { word: "look", syn: "see", ant: "ignore", decoys: ["eat", "run"] },
    { word: "shout", syn: "yell", ant: "whisper", decoys: ["skip", "draw"] },
    { word: "close", syn: "near", ant: "far", decoys: ["clean", "new"] },
  ],
  mid: [
    { word: "brave", syn: "courageous", ant: "fearful", decoys: ["curious", "ancient"] },
    { word: "difficult", syn: "challenging", ant: "easy", decoys: ["distant", "frequent"] },
    { word: "enormous", syn: "gigantic", ant: "tiny", decoys: ["fragile", "smooth"] },
    { word: "ancient", syn: "old", ant: "modern", decoys: ["golden", "hidden"] },
    { word: "furious", syn: "angry", ant: "calm", decoys: ["dizzy", "generous"] },
    { word: "rapid", syn: "swift", ant: "sluggish", decoys: ["narrow", "polite"] },
    { word: "gloomy", syn: "dreary", ant: "cheerful", decoys: ["slippery", "sturdy"] },
    { word: "generous", syn: "giving", ant: "selfish", decoys: ["nervous", "distant"] },
    { word: "fragile", syn: "delicate", ant: "sturdy", decoys: ["bitter", "eager"] },
    { word: "vacant", syn: "empty", ant: "occupied", decoys: ["visible", "gentle"] },
    { word: "assist", syn: "help", ant: "hinder", decoys: ["arrive", "argue"] },
    { word: "conceal", syn: "hide", ant: "reveal", decoys: ["collect", "compare"] },
  ],
  upper: [
    { word: "abundant", syn: "plentiful", ant: "scarce", decoys: ["arrogant", "abstract"] },
    { word: "benevolent", syn: "kindhearted", ant: "cruel", decoys: ["bewildered", "brittle"] },
    { word: "candid", syn: "honest", ant: "deceptive", decoys: ["cautious", "clumsy"] },
    { word: "diligent", syn: "hardworking", ant: "lazy", decoys: ["dominant", "durable"] },
    { word: "eloquent", syn: "articulate", ant: "inarticulate", decoys: ["elastic", "elderly"] },
    { word: "hostile", syn: "unfriendly", ant: "welcoming", decoys: ["humble", "hollow"] },
    { word: "meticulous", syn: "precise", ant: "careless", decoys: ["mediocre", "mobile"] },
    { word: "obscure", syn: "unclear", ant: "obvious", decoys: ["obedient", "optimistic"] },
    { word: "prudent", syn: "sensible", ant: "reckless", decoys: ["prominent", "punctual"] },
    { word: "resilient", syn: "tough", ant: "fragile", decoys: ["reluctant", "radiant"] },
    { word: "skeptical", syn: "doubtful", ant: "trusting", decoys: ["spontaneous", "solemn"] },
    { word: "tranquil", syn: "peaceful", ant: "chaotic", decoys: ["transparent", "tremendous"] },
  ],
};

function bandFor(grade: number): WordRow[] {
  return grade <= 2 ? wordsByBand.early : grade <= 5 ? wordsByBand.mid : wordsByBand.upper;
}

function synonymGen(grade: number) {
  return () =>
    shuffle(bandFor(grade)).map((r) =>
      mcq(grade <= 2 ? 1 : 3, `Which word means almost the SAME as "${r.word}"?`, r.syn,
        [[r.ant, "chose-antonym"], [r.decoys[0], "unrelated-word"], [r.decoys[1], "unrelated-word"]],
        `"${r.syn}" is a synonym of "${r.word}" — they mean nearly the same thing. "${r.ant}" is the opposite.`)
    );
}

function antonymGen(grade: number) {
  return () =>
    shuffle(bandFor(grade)).map((r) =>
      mcq(grade <= 2 ? 1 : 3, `Which word means the OPPOSITE of "${r.word}"?`, r.ant,
        [[r.syn, "chose-synonym"], [r.decoys[0], "unrelated-word"], [r.decoys[1], "unrelated-word"]],
        `"${r.ant}" is an antonym of "${r.word}" — it means the opposite. "${r.syn}" means the same.`)
    );
}

// Grammar: pick the correct sentence
const grammarByBand: Record<string, [string, string, string, string][]> = {
  // [correct, wrong, tag, explanation]
  early: [
    ["The dog runs fast.", "The dog run fast.", "subject-verb-agreement", "One dog RUNS. We add -s to the verb when one person or thing does it."],
    ["I have two cats.", "I has two cats.", "subject-verb-agreement", "With 'I' we say 'have', not 'has'."],
    ["She is my friend.", "She are my friend.", "subject-verb-agreement", "'She' goes with 'is'. 'Are' is for more than one."],
    ["We went to the park.", "We goed to the park.", "irregular-verb", "'Went' is the past tense of 'go' — it's an irregular verb."],
    ["They are playing outside.", "They is playing outside.", "subject-verb-agreement", "'They' goes with 'are'."],
    ["He ate an apple.", "He eated an apple.", "irregular-verb", "'Ate' is the past tense of 'eat'."],
    ["The birds sing loudly.", "The birds sings loudly.", "subject-verb-agreement", "Many birds SING — no -s on the verb when the subject is plural."],
    ["I saw a big elephant.", "I seen a big elephant.", "irregular-verb", "'Saw' is the past tense of 'see'. 'Seen' needs a helper like 'have'."],
  ],
  mid: [
    ["Maria and I went to the store.", "Maria and me went to the store.", "pronoun-case", "Use 'I' when it's part of the subject: 'Maria and I went'."],
    ["There are fewer apples than oranges.", "There are less apples than oranges.", "fewer-vs-less", "Use 'fewer' for things you can count, like apples."],
    ["The team played its best game.", "The team played it's best game.", "its-vs-its", "'Its' shows belonging. 'It's' means 'it is'."],
    ["You're going to love this book.", "Your going to love this book.", "your-vs-youre", "'You're' = 'you are'. 'Your' shows belonging."],
    ["They're bringing their dog over there.", "There bringing they're dog over their.", "there-their-theyre", "'They're' = they are; 'their' = belonging; 'there' = a place."],
    ["Neither of the boys was ready.", "Neither of the boys were ready.", "subject-verb-agreement", "'Neither' is singular, so it takes 'was'."],
    ["She did well on the test.", "She did good on the test.", "adjective-vs-adverb", "'Well' is the adverb that describes HOW she did."],
    ["Whose backpack is this?", "Who's backpack is this?", "whose-vs-whos", "'Whose' shows belonging. 'Who's' means 'who is'."],
  ],
  upper: [
    ["The data suggest a different conclusion.", "Him and me reviewed the data yesterday.", "pronoun-case", "Subjects need subject pronouns: 'He and I reviewed the data.'"],
    ["Everyone should bring his or her own lunch.", "Everyone should bring they lunch.", "pronoun-agreement", "'Everyone' is singular; use 'his or her' (or rewrite with 'their' consistently)."],
    ["Having finished the essay, Jamal submitted it online.", "Having finished the essay, it was submitted online by Jamal.", "dangling-modifier", "The person who finished the essay (Jamal) must come right after the opening phrase."],
    ["The committee has made its decision.", "The committee have made it's decision.", "its-vs-its", "'Committee' acts as one unit ('has'), and 'its' (no apostrophe) shows possession."],
    ["She runs faster than he does.", "She runs faster then him.", "then-vs-than", "'Than' compares; 'then' tells when. And 'he does' completes the comparison."],
    ["The effect of the storm was severe.", "The affect of the storm was severe.", "affect-vs-effect", "'Effect' is the noun (the result). 'Affect' is usually a verb."],
    ["Between you and me, the movie was disappointing.", "Between you and I, the movie was disappointing.", "pronoun-case", "After a preposition like 'between', use the object pronoun 'me'."],
    ["Each of the players practices daily.", "Each of the players practice daily.", "subject-verb-agreement", "'Each' is singular, so the verb takes -s: 'practices'."],
  ],
};

function grammarGen(grade: number) {
  const band = grade <= 2 ? "early" : grade <= 5 ? "mid" : "upper";
  return () =>
    shuffle(grammarByBand[band]).map(([correct, wrong, tag, expl]) =>
      mcq(grade <= 2 ? 2 : 3, "Which sentence is written correctly?", correct, [[wrong, tag]], expl)
    );
}

// Reading comprehension passages
type Passage = { text: string; questions: { q: string; a: string; wrong: [string, string][]; expl: string }[] };

const passagesByBand: Record<string, Passage[]> = {
  early: [
    {
      text: "Sam has a red kite. One windy day, Sam took the kite to the hill. The wind lifted the kite high into the sky. Then the string broke! The kite landed in a tall tree. Sam's dad helped get it down with a ladder.",
      questions: [
        { q: "What color is Sam's kite?", a: "Red", wrong: [["Blue", "detail-recall"], ["Green", "detail-recall"], ["Yellow", "detail-recall"]], expl: "The story says 'Sam has a red kite.'" },
        { q: "Where did the kite land?", a: "In a tall tree", wrong: [["In the lake", "detail-recall"], ["On the roof", "detail-recall"], ["On the hill", "detail-recall"]], expl: "The story says 'The kite landed in a tall tree.'" },
        { q: "Who helped Sam get the kite back?", a: "Sam's dad", wrong: [["Sam's mom", "detail-recall"], ["A firefighter", "detail-recall"], ["Sam's friend", "detail-recall"]], expl: "'Sam's dad helped get it down with a ladder.'" },
        { q: "Why did the kite fly away?", a: "The string broke", wrong: [["Sam let go on purpose", "inference-error"], ["A bird took it", "inference-error"], ["It rained", "inference-error"]], expl: "The story says 'Then the string broke!' — that's why the kite got away." },
      ],
    },
    {
      text: "Mia planted a tiny seed in a pot. Every day she gave it water and put it in the sun. After two weeks, a small green sprout appeared. Mia was so proud! By summer, the plant had grown a bright yellow sunflower.",
      questions: [
        { q: "What did Mia plant?", a: "A tiny seed", wrong: [["A flower", "detail-recall"], ["A tree", "detail-recall"], ["A vegetable", "detail-recall"]], expl: "The first sentence says Mia planted a tiny seed." },
        { q: "What did Mia give the seed every day?", a: "Water and sunlight", wrong: [["Milk", "detail-recall"], ["Candy", "detail-recall"], ["Nothing", "detail-recall"]], expl: "'Every day she gave it water and put it in the sun.'" },
        { q: "What grew from the seed?", a: "A sunflower", wrong: [["A rose", "detail-recall"], ["A pumpkin", "detail-recall"], ["An apple tree", "detail-recall"]], expl: "'The plant had grown a bright yellow sunflower.'" },
        { q: "How did Mia feel when the sprout appeared?", a: "Proud", wrong: [["Angry", "feeling-inference"], ["Scared", "feeling-inference"], ["Bored", "feeling-inference"]], expl: "The story says 'Mia was so proud!'" },
      ],
    },
  ],
  mid: [
    {
      text: "The lighthouse keeper's daughter, Elena, knew every rock along the coast. One foggy night, she noticed the lighthouse lamp had gone dark — the oil had run out. A ship's horn sounded in the distance. Thinking quickly, Elena gathered every lantern in the house and hung them in the tower window. The ship's captain saw the faint glow and steered away from the rocks just in time.",
      questions: [
        { q: "What problem did Elena discover?", a: "The lighthouse lamp had gone dark", wrong: [["A ship had crashed", "sequence-error"], ["The lanterns were missing", "detail-recall"], ["The fog had cleared", "detail-recall"]], expl: "Elena noticed the lamp had gone dark because the oil ran out." },
        { q: "How did Elena solve the problem?", a: "She hung lanterns in the tower window", wrong: [["She rowed out to warn the ship", "inference-error"], ["She refilled the oil", "detail-recall"], ["She rang a bell", "detail-recall"]], expl: "She gathered every lantern in the house and hung them in the tower window." },
        { q: "What word BEST describes Elena?", a: "Resourceful", wrong: [["Careless", "character-trait"], ["Lazy", "character-trait"], ["Fearful", "character-trait"]], expl: "Elena used what she had (lanterns) to solve a big problem quickly — that's being resourceful." },
        { q: "What would most likely have happened without Elena's actions?", a: "The ship would have hit the rocks", wrong: [["The fog would have lifted", "prediction-error"], ["The captain would have seen the rocks anyway", "prediction-error"], ["Nothing would have changed", "prediction-error"]], expl: "The captain steered away 'just in time' thanks to the glow — without it, the ship was heading for the rocks." },
      ],
    },
    {
      text: "Octopuses are among the smartest animals in the ocean. They can open jars, solve mazes, and even use coconut shells as portable shelters. An octopus has no bones, so it can squeeze through any opening larger than its beak. Scientists have observed octopuses changing both the color and texture of their skin in less than a second to hide from predators.",
      questions: [
        { q: "What is the main idea of this passage?", a: "Octopuses are intelligent and have amazing abilities", wrong: [["Octopuses live in coconut shells", "main-idea-vs-detail"], ["The ocean is full of predators", "main-idea-vs-detail"], ["Scientists study sea animals", "main-idea-vs-detail"]], expl: "Every sentence gives an example of how smart and capable octopuses are — that's the main idea." },
        { q: "Why can an octopus squeeze through tiny openings?", a: "It has no bones", wrong: [["It is very small", "detail-recall"], ["It can change color", "cause-effect-confusion"], ["It uses its beak to dig", "detail-recall"]], expl: "The passage says an octopus has no bones, so it can squeeze through openings larger than its beak." },
        { q: "Why do octopuses change their skin color and texture?", a: "To hide from predators", wrong: [["To attract mates", "detail-recall"], ["To stay warm", "inference-error"], ["To communicate with scientists", "inference-error"]], expl: "The passage says they change skin 'to hide from predators.'" },
        { q: "Which detail supports the idea that octopuses use tools?", a: "They use coconut shells as portable shelters", wrong: [["They have no bones", "supporting-detail"], ["They change color quickly", "supporting-detail"], ["They live in the ocean", "supporting-detail"]], expl: "Using a coconut shell as a shelter is an example of tool use." },
      ],
    },
  ],
  upper: [
    {
      text: "In 1854, London suffered a deadly cholera outbreak. Most doctors blamed 'bad air,' but physician John Snow suspected the water supply. He mapped every cholera case in the Soho neighborhood and noticed they clustered around a single water pump on Broad Street. When officials removed the pump's handle, new cases plummeted. Snow's careful mapping is now considered a founding moment of modern epidemiology — the science of tracking disease.",
      questions: [
        { q: "What did most doctors at the time believe caused cholera?", a: "Bad air", wrong: [["Contaminated water", "detail-recall"], ["Insect bites", "detail-recall"], ["Poor diet", "detail-recall"]], expl: "The passage says 'Most doctors blamed bad air,' while Snow suspected the water." },
        { q: "What evidence led Snow to the Broad Street pump?", a: "Cholera cases clustered around it on his map", wrong: [["The water smelled strange", "detail-recall"], ["Officials told him about it", "detail-recall"], ["He got sick himself", "inference-error"]], expl: "Snow mapped every case and saw they clustered around the pump." },
        { q: "What can you infer from the fact that cases 'plummeted' after the handle was removed?", a: "The pump's water was indeed the source of the outbreak", wrong: [["The outbreak was ending anyway", "inference-error"], ["Bad air had cleared from the neighborhood", "inference-error"], ["People stopped reporting illness", "inference-error"]], expl: "If removing access to the pump stopped new cases, the water it supplied was almost certainly the source." },
        { q: "The word 'epidemiology' in this passage means:", a: "The science of tracking disease", wrong: [["The study of water pumps", "context-clue-error"], ["The history of London", "context-clue-error"], ["A type of medicine", "context-clue-error"]], expl: "The passage defines it directly: 'epidemiology — the science of tracking disease.'" },
      ],
    },
    {
      text: "The student council debated whether to replace the school's vending machines with a fresh fruit stand. Supporters argued that fruit would improve concentration and health, citing a study in which students who ate fruit at midmorning scored higher on afternoon tests. Opponents countered that vending machine sales funded the annual field trip, raising nearly two thousand dollars each year. In the end, the council proposed a compromise: keep one machine, add the fruit stand, and split the proceeds.",
      questions: [
        { q: "What was the main disagreement about?", a: "Whether to replace vending machines with a fruit stand", wrong: [["Whether to cancel the field trip", "main-idea-vs-detail"], ["Which fruits to sell", "main-idea-vs-detail"], ["How to raise test scores", "main-idea-vs-detail"]], expl: "The debate was about replacing the vending machines with a fruit stand." },
        { q: "What evidence did supporters use?", a: "A study linking midmorning fruit to higher test scores", wrong: [["A petition from parents", "detail-recall"], ["The cost of vending machines", "detail-recall"], ["A doctor's speech", "detail-recall"]], expl: "Supporters cited a study in which students who ate fruit scored higher on afternoon tests." },
        { q: "Why did opponents want to keep the vending machines?", a: "The sales funded the annual field trip", wrong: [["They disliked fruit", "inference-error"], ["The machines were new", "detail-recall"], ["The fruit stand was too small", "detail-recall"]], expl: "Vending sales raised nearly two thousand dollars a year for the field trip." },
        { q: "The council's final proposal is best described as:", a: "A compromise between both sides", wrong: [["A victory for the supporters", "conclusion-error"], ["A victory for the opponents", "conclusion-error"], ["A decision to do nothing", "conclusion-error"]], expl: "Keeping one machine AND adding the fruit stand gives each side part of what it wanted — a compromise." },
      ],
    },
  ],
};

function comprehensionGen(grade: number) {
  const band = grade <= 2 ? "early" : grade <= 5 ? "mid" : "upper";
  return () =>
    passagesByBand[band].flatMap((p) =>
      p.questions.map((q) =>
        mcq(grade <= 2 ? 2 : 4, `Read the passage:\n\n"${p.text}"\n\n${q.q}`, q.a, q.wrong, q.expl)
      )
    );
}

function skill(
  grade: number, order: number, slug: string, name: string, description: string,
  lesson: string, generate: () => GenQuestion[], prereqIds: string[] = []
): SkillDef {
  return { id: `reading-g${grade}-${slug}`, subject: "reading", grade, order, name, description, lesson, prereqIds, generate };
}

export const readingSkills: SkillDef[] = [];

for (let grade = 1; grade <= 8; grade++) {
  readingSkills.push(
    skill(grade, 1, "synonyms", "Synonyms", "Words that mean the same thing.",
      `## Synonyms\nSynonyms are words that mean the SAME (or almost the same) thing.\n\n**Examples:** big/large, happy/glad, fast/quick\n\nUsing synonyms makes your writing more interesting!`,
      synonymGen(grade)),
    skill(grade, 2, "antonyms", "Antonyms", "Words that mean the opposite.",
      `## Antonyms\nAntonyms are words that mean the OPPOSITE.\n\n**Examples:** hot/cold, big/small, happy/sad\n\n**Tip:** Prefixes like un- and dis- often make antonyms: kind → unkind.`,
      antonymGen(grade), [`reading-g${grade}-synonyms`]),
    skill(grade, 3, "grammar", "Grammar and Usage", "Choose correctly written sentences.",
      `## Grammar Rules\nGood sentences follow rules:\n- The verb must MATCH the subject (one dog runs, two dogs run)\n- Use the right word: their/there/they're, its/it's, your/you're\n- Past tense verbs can be tricky: go → went, see → saw, eat → ate`,
      grammarGen(grade)),
    skill(grade, 4, "comprehension", "Reading Comprehension", "Read passages and answer questions.",
      `## Reading Carefully\nWhen you read a passage:\n1. Look for the **main idea** — what is it mostly about?\n2. Notice **details** — who, what, where, when, why\n3. **Infer** — use clues to figure out things the author doesn't say directly\n4. Go back and re-read to check your answers!`,
      comprehensionGen(grade), [`reading-g${grade}-synonyms`])
  );
}
