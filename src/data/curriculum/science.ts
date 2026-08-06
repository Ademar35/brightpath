import { GenQuestion, SkillDef, mcq } from "./types";

function skill(
  grade: number, order: number, slug: string, name: string, description: string,
  lesson: string, qs: GenQuestion[], prereqIds: string[] = []
): SkillDef {
  return { id: `science-g${grade}-${slug}`, subject: "science", grade, order, name, description, lesson, prereqIds, generate: () => qs };
}

export const scienceSkills: SkillDef[] = [
  // Grade 1-2: Living things & weather
  skill(1, 1, "living-nonliving", "Living vs. Nonliving", "Sort things as living or nonliving.",
    `## Living or Nonliving?\nLiving things grow, need food/water, and can reproduce. Nonliving things don't!\n\n**Living:** plants, animals, people\n**Nonliving:** rocks, water, toys`,
    [
      mcq(1, "Which of these is a LIVING thing?", "A tree", [["A rock", "living-nonliving-confusion"], ["A chair", "living-nonliving-confusion"], ["A car", "living-nonliving-confusion"]], "A tree grows and needs water and sunlight — it's living."),
      mcq(1, "Which of these is NONLIVING?", "A rock", [["A dog", "living-nonliving-confusion"], ["A flower", "living-nonliving-confusion"], ["A bird", "living-nonliving-confusion"]], "A rock does not grow or need food — it's nonliving."),
      mcq(1, "What do all living things need?", "Food and water", [["Electricity", "living-nonliving-confusion"], ["Batteries", "living-nonliving-confusion"], ["Money", "living-nonliving-confusion"]], "All living things need food and water to survive."),
      mcq(2, "A car can move, but is it living?", "No, it is nonliving", [["Yes, because it moves", "movement-equals-living-misconception"]], "Moving alone doesn't make something living — it must grow and need food."),
      mcq(1, "Which of these is an animal?", "A fish", [["A cloud", "living-nonliving-confusion"], ["A table", "living-nonliving-confusion"], ["A pencil", "living-nonliving-confusion"]], "A fish is a living animal that swims and breathes."),
    ]),
  skill(1, 2, "five-senses", "The Five Senses", "Identify the five senses and their organs.",
    `## The Five Senses\n1. **Sight** — eyes\n2. **Hearing** — ears\n3. **Smell** — nose\n4. **Taste** — tongue\n5. **Touch** — skin`,
    [
      mcq(1, "Which body part do you use to SEE?", "Eyes", [["Ears", "sense-organ-confusion"], ["Nose", "sense-organ-confusion"], ["Tongue", "sense-organ-confusion"]], "Eyes let us see the world around us."),
      mcq(1, "Which sense helps you know a food is sweet?", "Taste", [["Hearing", "sense-organ-confusion"], ["Sight", "sense-organ-confusion"], ["Smell", "sense-organ-confusion"]], "Your tongue tastes flavors like sweet, sour, and salty."),
      mcq(1, "Which body part do you use to HEAR music?", "Ears", [["Eyes", "sense-organ-confusion"], ["Skin", "sense-organ-confusion"], ["Nose", "sense-organ-confusion"]], "Ears let us hear sounds like music."),
      mcq(1, "Touching ice, your skin feels...", "Cold", [["Loud", "sense-mismatch"], ["Sweet", "sense-mismatch"], ["Bright", "sense-mismatch"]], "Skin (touch) tells us about temperature and texture, like cold."),
      mcq(2, "Which sense would you use to tell a rose has a nice smell?", "Smell", [["Sight", "sense-organ-confusion"], ["Touch", "sense-organ-confusion"], ["Hearing", "sense-organ-confusion"]], "Your nose detects smells like flowers."),
    ]),
  skill(2, 1, "weather", "Weather and Seasons", "Understand weather patterns and the four seasons.",
    `## Weather and Seasons\nThe four seasons are **spring, summer, fall, and winter**. Each has different weather patterns and temperatures.`,
    [
      mcq(1, "Which season is usually the HOTTEST?", "Summer", [["Winter", "season-confusion"], ["Fall", "season-confusion"], ["Spring", "season-confusion"]], "Summer has the most sunlight and heat."),
      mcq(1, "In which season do leaves usually change color and fall?", "Fall", [["Summer", "season-confusion"], ["Winter", "season-confusion"], ["Spring", "season-confusion"]], "Fall (autumn) is when leaves change color and drop."),
      mcq(1, "What falls from clouds when it's cold enough?", "Snow", [["Sunshine", "weather-confusion"], ["Wind", "weather-confusion"], ["Leaves", "weather-confusion"]], "When it's cold, precipitation falls as snow instead of rain."),
      mcq(2, "A thermometer measures...", "Temperature", [["Wind speed", "instrument-confusion"], ["Rainfall", "instrument-confusion"], ["Time", "instrument-confusion"]], "A thermometer tells us how hot or cold it is."),
      mcq(1, "Which season comes right after winter?", "Spring", [["Summer", "season-order-confusion"], ["Fall", "season-order-confusion"], ["Winter again", "season-order-confusion"]], "The seasons go: winter → spring → summer → fall."),
    ]),
  skill(2, 2, "plant-parts", "Parts of a Plant", "Identify roots, stem, leaves, and flowers.",
    `## Parts of a Plant\n- **Roots** — take in water, hold the plant in soil\n- **Stem** — carries water up, holds the plant up\n- **Leaves** — make food using sunlight\n- **Flowers** — make seeds`,
    [
      mcq(1, "Which part of a plant takes in water from the soil?", "Roots", [["Leaves", "plant-part-confusion"], ["Flowers", "plant-part-confusion"], ["Stem", "plant-part-confusion"]], "Roots grow underground and absorb water."),
      mcq(1, "Which part makes food for the plant using sunlight?", "Leaves", [["Roots", "plant-part-confusion"], ["Stem", "plant-part-confusion"], ["Flowers", "plant-part-confusion"]], "Leaves use sunlight to make food (photosynthesis)."),
      mcq(1, "Which part holds the plant up and carries water to the leaves?", "Stem", [["Roots", "plant-part-confusion"], ["Flowers", "plant-part-confusion"], ["Leaves", "plant-part-confusion"]], "The stem supports the plant and moves water upward."),
      mcq(2, "What do flowers help a plant do?", "Make seeds", [["Absorb water", "plant-part-confusion"], ["Make food", "plant-part-confusion"], ["Grow taller", "plant-part-confusion"]], "Flowers produce seeds so new plants can grow."),
    ]),
  // Grade 3-4
  skill(3, 1, "life-cycles", "Animal Life Cycles", "Understand stages of animal life cycles.",
    `## Life Cycles\nMany animals go through stages as they grow.\n\n**Butterfly:** egg → caterpillar → chrysalis → butterfly\n**Frog:** egg → tadpole → froglet → frog`,
    [
      mcq(2, "What is the FIRST stage of a butterfly's life cycle?", "Egg", [["Caterpillar", "sequence-error"], ["Chrysalis", "sequence-error"], ["Butterfly", "sequence-error"]], "A butterfly's life cycle starts as an egg."),
      mcq(2, "What comes right after 'caterpillar' in a butterfly's life cycle?", "Chrysalis", [["Egg", "sequence-error"], ["Butterfly", "sequence-error"], ["Tadpole", "sequence-error"]], "After caterpillar comes the chrysalis (pupa) stage."),
      mcq(2, "A tadpole eventually grows into a...", "Frog", [["Fish", "life-cycle-confusion"], ["Butterfly", "life-cycle-confusion"], ["Bird", "life-cycle-confusion"]], "Tadpoles grow legs and lungs and become frogs."),
      mcq(3, "Why do animals go through a life cycle?", "To grow and change into adults that can reproduce", [["To change color only", "purpose-misconception"], ["To find new homes", "purpose-misconception"]], "Life cycles let animals grow, change, and eventually make more of their own kind."),
    ]),
  skill(3, 2, "states-of-matter", "States of Matter", "Distinguish solid, liquid, and gas.",
    `## States of Matter\n- **Solid** — has its own shape (ice, rock)\n- **Liquid** — takes the shape of its container (water, juice)\n- **Gas** — spreads out to fill any space (steam, air)`,
    [
      mcq(1, "Ice is an example of a...", "Solid", [["Liquid", "state-of-matter-confusion"], ["Gas", "state-of-matter-confusion"]], "Ice keeps its own shape, so it's a solid."),
      mcq(1, "Water in a cup is an example of a...", "Liquid", [["Solid", "state-of-matter-confusion"], ["Gas", "state-of-matter-confusion"]], "Water takes the shape of its container — that's a liquid."),
      mcq(2, "When water boils, it turns into steam, which is a...", "Gas", [["Solid", "state-of-matter-confusion"], ["Liquid", "state-of-matter-confusion"]], "Steam spreads out and fills space — that's a gas."),
      mcq(2, "What happens to ice when it gets warm?", "It melts into a liquid", [["It turns into a gas immediately", "state-change-error"], ["It stays a solid", "state-change-error"]], "Melting is when a solid turns into a liquid as it warms up."),
    ]),
  skill(4, 1, "food-chains", "Food Chains", "Understand producers, consumers, and food chains.",
    `## Food Chains\n- **Producers** (plants) make their own food from sunlight\n- **Consumers** (animals) eat other living things\n- **Decomposers** break down dead material\n\n**Example chain:** grass → rabbit → fox`,
    [
      mcq(2, "In a food chain, plants are called...", "Producers", [["Consumers", "food-chain-role-confusion"], ["Decomposers", "food-chain-role-confusion"]], "Plants make their own food, so they're producers."),
      mcq(2, "An animal that eats other animals is called a...", "Consumer", [["Producer", "food-chain-role-confusion"], ["Decomposer", "food-chain-role-confusion"]], "Animals that eat other living things are consumers."),
      mcq(3, "In the food chain grass → rabbit → fox, what does the fox eat?", "The rabbit", [["The grass", "food-chain-order-error"], ["Nothing, it's a producer", "food-chain-role-confusion"]], "Arrows point from food to eater: the fox eats the rabbit."),
      mcq(3, "What role do decomposers like fungi play?", "They break down dead plants and animals", [["They make food from sunlight", "food-chain-role-confusion"], ["They hunt other animals", "food-chain-role-confusion"]], "Decomposers recycle nutrients by breaking down dead material."),
    ]),
  skill(4, 2, "earth-moon-sun", "Earth, Moon, and Sun", "Understand day/night and the moon's phases.",
    `## Earth, Moon, and Sun\n- Earth **rotates** (spins) once a day, causing day and night.\n- Earth **orbits** (circles) the sun once a year.\n- The moon orbits Earth and reflects the sun's light.`,
    [
      mcq(2, "Why do we have day and night?", "Earth rotates on its axis", [["The sun moves around Earth", "geocentric-misconception"], ["The moon blocks the sun", "eclipse-confusion"]], "As Earth spins, different sides face the sun, creating day and night."),
      mcq(3, "How long does it take Earth to orbit the sun once?", "About one year", [["One day", "orbit-rotation-confusion"], ["One month", "orbit-rotation-confusion"]], "Earth takes about 365 days (one year) to go around the sun."),
      mcq(2, "Why does the moon appear to shine?", "It reflects light from the sun", [["It makes its own light", "moon-light-misconception"], ["It reflects light from Earth", "moon-light-misconception"]], "The moon doesn't make light — it reflects sunlight."),
    ]),
  // Grade 5-6
  skill(5, 1, "ecosystems", "Ecosystems", "Understand how organisms interact in ecosystems.",
    `## Ecosystems\nAn ecosystem is all the living and nonliving things in an area interacting together — like a forest, pond, or desert.`,
    [
      mcq(3, "What is an ecosystem?", "Living and nonliving things interacting in an area", [["Only the animals in a place", "ecosystem-definition-error"], ["Only the plants in a place", "ecosystem-definition-error"]], "An ecosystem includes living things (plants, animals) AND nonliving things (water, soil, air)."),
      mcq(3, "If a drought removes all the water from a pond ecosystem, what will likely happen?", "Many organisms will die or leave", [["Nothing will change", "ecosystem-interdependence-error"], ["More animals will move in", "ecosystem-interdependence-error"]], "Water is essential, so removing it disrupts the whole ecosystem."),
      mcq(4, "Removing all the wolves (top predators) from a forest would most likely cause...", "Deer population to grow too large", [["Deer population to shrink", "food-web-misconception"], ["No change at all", "food-web-misconception"]], "Without predators, prey populations like deer can grow unchecked."),
    ]),
  skill(5, 2, "matter-cycles", "Matter and Energy", "Understand conservation of matter and energy transfer.",
    `## Matter and Energy\nMatter can change form but is never created or destroyed — it's **conserved**. Energy flows through ecosystems from the sun to producers to consumers.`,
    [
      mcq(4, "When wood burns, the ash weighs less than the original wood. Where did the rest of the matter go?", "It turned into gases that escaped into the air", [["It disappeared completely", "conservation-of-matter-error"], ["It was destroyed", "conservation-of-matter-error"]], "Matter isn't destroyed — much of the wood becomes gases (like smoke and CO2) that escape."),
      mcq(3, "Where does the energy in a food chain originally come from?", "The sun", [["The soil", "energy-source-error"], ["The consumers", "energy-source-error"]], "Producers capture energy from sunlight, which then flows through the food chain."),
    ]),
  skill(6, 1, "cells", "Cells", "Understand that cells are the basic unit of life.",
    `## Cells\nAll living things are made of **cells** — the basic unit of life.\n- **Plant cells** have a cell wall and chloroplasts.\n- **Animal cells** do not.`,
    [
      mcq(3, "What is the basic unit of all living things?", "The cell", [["The organ", "cell-theory-error"], ["The atom", "cell-theory-error"]], "Cells are the smallest basic unit that makes up all living things."),
      mcq(3, "What structure do plant cells have that animal cells do NOT?", "A cell wall", [["A nucleus", "cell-structure-confusion"], ["Cytoplasm", "cell-structure-confusion"]], "Plant cells have a rigid cell wall for structure; animal cells don't."),
      mcq(3, "What part of the cell controls its activities, like a 'brain'?", "The nucleus", [["The cell wall", "cell-structure-confusion"], ["The cytoplasm", "cell-structure-confusion"]], "The nucleus contains DNA and directs the cell's activities."),
    ]),
  skill(6, 2, "energy-forms", "Forms of Energy", "Identify types of energy and transformations.",
    `## Forms of Energy\nEnergy comes in many forms: **kinetic** (motion), **potential** (stored), **thermal** (heat), **light**, **sound**, **electrical**, **chemical**.`,
    [
      mcq(3, "A ball sitting at the top of a hill has what kind of energy?", "Potential energy", [["Kinetic energy", "energy-type-confusion"], ["Thermal energy", "energy-type-confusion"]], "Stored energy due to position is potential energy."),
      mcq(3, "A ball rolling down a hill has what kind of energy?", "Kinetic energy", [["Potential energy", "energy-type-confusion"], ["Chemical energy", "energy-type-confusion"]], "Energy of motion is kinetic energy."),
      mcq(4, "A battery stores what kind of energy that becomes electrical energy?", "Chemical energy", [["Thermal energy", "energy-type-confusion"], ["Light energy", "energy-type-confusion"]], "Batteries store chemical energy, which converts to electrical energy when used."),
    ]),
  // Grade 7-8
  skill(7, 1, "atoms-elements", "Atoms and Elements", "Understand atoms, elements, and the periodic table basics.",
    `## Atoms and Elements\nAll matter is made of **atoms**. An **element** is a substance made of only one type of atom (like oxygen or gold). The periodic table organizes all known elements.`,
    [
      mcq(3, "What is the smallest particle that still has the properties of an element?", "An atom", [["A molecule", "atom-molecule-confusion"], ["A cell", "atom-molecule-confusion"]], "An atom is the basic building block of elements."),
      mcq(3, "Water (H2O) is made of hydrogen and oxygen combined. Water is called a...", "Compound", [["Element", "element-compound-confusion"], ["Atom", "element-compound-confusion"]], "A compound is two or more elements chemically combined, like water."),
      mcq(3, "What organizes elements by their properties and atomic number?", "The periodic table", [["The food chain", "unrelated"], ["The water cycle", "unrelated"]], "The periodic table arranges all known elements."),
    ]),
  skill(7, 2, "forces-motion", "Forces and Motion", "Understand Newton's laws basics.",
    `## Forces and Motion\n**Newton's First Law:** An object at rest stays at rest, and an object in motion stays in motion, unless acted on by a force.\n\n**Newton's Second Law:** Force = mass × acceleration.`,
    [
      mcq(4, "A soccer ball at rest will stay at rest unless...", "A force acts on it", [["Time passes", "newtons-law-misconception"], ["It gets old", "newtons-law-misconception"]], "Newton's First Law: objects don't change motion without a force."),
      mcq(4, "If you push a shopping cart with more force, it will...", "Accelerate more (speed up faster)", [["Slow down", "force-effect-confusion"], ["Stay the same speed", "force-effect-confusion"]], "More force causes more acceleration (Newton's Second Law)."),
      mcq(3, "What force pulls objects toward Earth?", "Gravity", [["Friction", "force-type-confusion"], ["Magnetism", "force-type-confusion"]], "Gravity is the force that pulls objects toward Earth's center."),
    ]),
  skill(8, 1, "genetics", "Heredity and Genetics", "Understand traits passed from parents.",
    `## Heredity\nTraits are passed from parents to offspring through **genes**, found on **DNA**. Offspring get half their genes from each parent.`,
    [
      mcq(4, "Where are genes located?", "On DNA inside cells", [["In the bloodstream only", "genetics-location-error"], ["In the food we eat", "genetics-location-error"]], "Genes are segments of DNA found in the nucleus of cells."),
      mcq(4, "A child typically gets genetic traits from...", "Both parents", [["Only the mother", "genetics-inheritance-error"], ["Only the father", "genetics-inheritance-error"]], "Offspring inherit genes from both biological parents."),
      mcq(4, "Eye color is an example of a...", "Inherited trait", [["Learned behavior", "trait-behavior-confusion"], ["Environmental factor", "trait-behavior-confusion"]], "Eye color is passed down genetically, not learned."),
    ]),
  skill(8, 2, "plate-tectonics", "Plate Tectonics", "Understand Earth's crust and plate movement.",
    `## Plate Tectonics\nEarth's crust is broken into huge **plates** that slowly move. Their movement causes earthquakes, volcanoes, and mountain formation.`,
    [
      mcq(4, "What causes most earthquakes?", "Movement of tectonic plates", [["Ocean tides", "tectonic-cause-confusion"], ["Weather changes", "tectonic-cause-confusion"]], "Earthquakes occur when tectonic plates shift or grind against each other."),
      mcq(4, "Mountain ranges like the Himalayas often form when...", "Two tectonic plates collide", [["A volcano cools down", "tectonic-cause-confusion"], ["An ocean dries up", "tectonic-cause-confusion"]], "Colliding plates push crust upward, forming mountains."),
      mcq(3, "Earth's outer layer, broken into moving plates, is called the...", "Crust", [["Core", "earth-layer-confusion"], ["Mantle magma only", "earth-layer-confusion"]], "The crust is Earth's outermost layer, divided into tectonic plates."),
    ]),
];
