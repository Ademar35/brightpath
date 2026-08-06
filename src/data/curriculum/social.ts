import { GenQuestion, SkillDef, mcq } from "./types";

function skill(
  grade: number, order: number, slug: string, name: string, description: string,
  lesson: string, qs: GenQuestion[], prereqIds: string[] = []
): SkillDef {
  return { id: `social-g${grade}-${slug}`, subject: "social", grade, order, name, description, lesson, prereqIds, generate: () => qs };
}

export const socialSkills: SkillDef[] = [
  skill(1, 1, "community-helpers", "Community Helpers", "Learn about people who help our community.",
    `## Community Helpers\nMany people work to help our community: firefighters put out fires, doctors help us stay healthy, teachers help us learn, and police officers keep us safe.`,
    [
      mcq(1, "Who helps put out fires?", "A firefighter", [["A doctor", "role-confusion"], ["A teacher", "role-confusion"], ["A chef", "role-confusion"]], "Firefighters are trained to put out fires and keep us safe."),
      mcq(1, "Who helps you when you are sick?", "A doctor", [["A firefighter", "role-confusion"], ["A mail carrier", "role-confusion"], ["A librarian", "role-confusion"]], "Doctors help take care of our health."),
      mcq(1, "Who helps keep our neighborhood safe?", "A police officer", [["A cook", "role-confusion"], ["A farmer", "role-confusion"], ["A dentist", "role-confusion"]], "Police officers work to keep communities safe."),
      mcq(1, "Who delivers letters and packages?", "A mail carrier", [["A teacher", "role-confusion"], ["A doctor", "role-confusion"], ["A firefighter", "role-confusion"]], "Mail carriers deliver mail to homes and businesses."),
    ]),
  skill(1, 2, "maps-basics", "Maps and Directions", "Understand simple maps and directions.",
    `## Maps\nA map is a picture that shows where things are. **North, south, east, and west** are the four main directions. A map key (legend) tells you what symbols mean.`,
    [
      mcq(1, "What is a map?", "A picture that shows where places are", [["A list of names", "map-definition-error"], ["A kind of calendar", "map-definition-error"]], "A map shows the location of places and things."),
      mcq(2, "What are the four main directions on a map?", "North, south, east, west", [["Up, down, left, right", "direction-confusion"], ["Left, right, forward, back", "direction-confusion"]], "Maps use north, south, east, and west as the main directions."),
      mcq(2, "What tells you what the symbols on a map mean?", "The map key (legend)", [["The title", "map-part-confusion"], ["The compass", "map-part-confusion"]], "The map key explains what each symbol represents."),
    ]),
  skill(2, 1, "needs-wants", "Needs and Wants", "Distinguish between needs and wants.",
    `## Needs vs. Wants\n**Needs** are things you must have to survive: food, water, shelter, clothing.\n**Wants** are things that are nice to have but not required: toys, candy, video games.`,
    [
      mcq(1, "Which of these is a NEED?", "Water", [["A toy", "needs-wants-confusion"], ["A video game", "needs-wants-confusion"], ["Candy", "needs-wants-confusion"]], "Water is something we must have to survive — a need."),
      mcq(1, "Which of these is a WANT?", "A toy robot", [["Food", "needs-wants-confusion"], ["Shelter", "needs-wants-confusion"], ["Clothing", "needs-wants-confusion"]], "A toy is nice to have but not required to survive — a want."),
      mcq(2, "Why is shelter considered a need?", "People need protection from weather to survive", [["It is fun to have a house", "needs-wants-confusion"], ["Everyone wants a big house", "needs-wants-confusion"]], "Shelter protects us from weather and danger, making it essential."),
    ]),
  skill(2, 2, "rules-laws", "Rules and Laws", "Understand why we have rules and laws.",
    `## Rules and Laws\nRules and laws help keep people safe and treat everyone fairly. Communities create laws; families and schools create rules.`,
    [
      mcq(1, "Why do we have rules and laws?", "To keep people safe and treat everyone fairly", [["To make life boring", "rules-purpose-confusion"], ["Because someone said so, for no reason", "rules-purpose-confusion"]], "Rules and laws exist to protect people and ensure fairness."),
      mcq(2, "Who usually makes the rules in a classroom?", "The teacher (and sometimes the class together)", [["Only students", "authority-confusion"], ["The principal only", "authority-confusion"]], "Teachers set classroom rules, often with student input."),
    ]),
  skill(3, 1, "map-skills", "Map Skills", "Read maps with scale, compass rose, and symbols.",
    `## Reading Maps\n- **Compass rose** shows N, S, E, W\n- **Map scale** shows how map distance relates to real distance\n- **Symbols** on the map key represent real things (like a star for a capital city)`,
    [
      mcq(2, "What symbol usually shows a state or country's capital city on a map?", "A star", [["A circle", "symbol-confusion"], ["A triangle", "symbol-confusion"]], "Maps often use a star symbol to mark capital cities."),
      mcq(3, "A map scale helps you figure out...", "Real-world distance between places", [["The temperature of a place", "map-scale-misconception"], ["The population of a place", "map-scale-misconception"]], "The scale converts distance on the map to real distance."),
      mcq(2, "What does a compass rose show?", "Directions (N, S, E, W)", [["Population size", "map-part-confusion"], ["Temperature", "map-part-confusion"]], "A compass rose shows the cardinal directions on a map."),
    ]),
  skill(3, 2, "govt-basics", "Levels of Government", "Understand local, state, and national government.",
    `## Levels of Government\n- **Local** government runs cities/towns (mayor)\n- **State** government runs states (governor)\n- **National (federal)** government runs the whole country (president)`,
    [
      mcq(3, "Who typically leads a city's local government?", "A mayor", [["A governor", "government-level-confusion"], ["A president", "government-level-confusion"]], "Mayors lead city or town governments."),
      mcq(3, "Who leads a state's government?", "A governor", [["A mayor", "government-level-confusion"], ["A senator only", "government-level-confusion"]], "Governors lead state governments."),
      mcq(3, "Who leads the national government of the United States?", "The president", [["A mayor", "government-level-confusion"], ["A governor", "government-level-confusion"]], "The president leads the national (federal) government."),
    ]),
  skill(4, 1, "us-regions", "Regions of the United States", "Identify major U.S. regions.",
    `## U.S. Regions\nThe U.S. is often divided into regions: **Northeast, Southeast, Midwest, Southwest, and West**. Each region has its own geography and climate.`,
    [
      mcq(3, "Which region is known for its desert landscapes, like Arizona?", "Southwest", [["Northeast", "region-confusion"], ["Midwest", "region-confusion"]], "The Southwest region includes desert states like Arizona and New Mexico."),
      mcq(3, "Which region includes states like New York and Massachusetts?", "Northeast", [["West", "region-confusion"], ["Southeast", "region-confusion"]], "New York and Massachusetts are in the Northeast region."),
      mcq(3, "Which region is known for the Great Plains and farmland, like Iowa and Kansas?", "Midwest", [["West", "region-confusion"], ["Southeast", "region-confusion"]], "The Midwest is known for its farmland and plains."),
    ]),
  skill(4, 2, "native-americans", "Early Native American Cultures", "Learn about regional Native American groups.",
    `## Native American Cultures\nDifferent Native American groups adapted to their environments — Plains tribes hunted buffalo, Northwest tribes fished, and Southwest tribes farmed in dry climates using irrigation.`,
    [
      mcq(3, "Plains tribes like the Lakota relied heavily on which animal?", "The buffalo (bison)", [["The whale", "native-culture-confusion"], ["The alligator", "native-culture-confusion"]], "Plains tribes used buffalo for food, clothing, and shelter."),
      mcq(3, "Native peoples of the Southwest, like the Hopi, used irrigation mainly to...", "Grow crops in a dry climate", [["Travel across oceans", "native-culture-confusion"], ["Build igloos", "native-culture-confusion"]], "Irrigation brought water to crops in the dry Southwest."),
    ]),
  skill(5, 1, "colonial-america", "Colonial America", "Understand the 13 colonies and colonial life.",
    `## Colonial America\nBritain established 13 colonies along the Atlantic coast of North America, grouped into **New England, Middle, and Southern** colonies, each with different economies.`,
    [
      mcq(3, "How many original British colonies were there?", "13", [["10", "fact-recall-error"], ["20", "fact-recall-error"]], "There were 13 original British colonies in America."),
      mcq(4, "Southern colonies relied heavily on which type of economy?", "Large farms and plantations", [["Fishing and shipbuilding", "colonial-economy-confusion"], ["Mining gold", "colonial-economy-confusion"]], "Southern colonies had a plantation-based agricultural economy."),
      mcq(3, "New England colonies' economy relied more on...", "Fishing, shipbuilding, and trade", [["Large plantations", "colonial-economy-confusion"], ["Desert farming", "colonial-economy-confusion"]], "New England's rocky soil led to fishing and trade-based economies."),
    ]),
  skill(5, 2, "american-revolution", "The American Revolution", "Understand causes and key events of the Revolution.",
    `## The American Revolution\nColonists fought Britain for independence (1775-1783), angered by **taxation without representation**. The Declaration of Independence was signed in 1776.`,
    [
      mcq(4, "What is 'taxation without representation'?", "Being taxed without having a say in government", [["Paying no taxes at all", "revolution-cause-confusion"], ["Voting on all taxes", "revolution-cause-confusion"]], "Colonists were taxed by Britain but had no representatives in Parliament."),
      mcq(3, "In what year was the Declaration of Independence signed?", "1776", [["1492", "date-confusion"], ["1865", "date-confusion"]], "The Declaration of Independence was signed in 1776."),
      mcq(3, "The American Revolution was a war between the colonies and...", "Great Britain", [["France", "revolution-opponent-confusion"], ["Spain", "revolution-opponent-confusion"]], "The colonists fought for independence from Great Britain."),
    ]),
  skill(6, 1, "ancient-civilizations", "Ancient Civilizations", "Learn about Mesopotamia, Egypt, and early river civilizations.",
    `## Ancient River Civilizations\nEarly civilizations grew along rivers because water supported farming: **Mesopotamia** (Tigris/Euphrates), **Egypt** (Nile), and others.`,
    [
      mcq(3, "Why did early civilizations often develop near rivers?", "Rivers provided water for farming and drinking", [["Rivers were good for fighting wars", "civilization-development-error"], ["Rivers had no purpose", "civilization-development-error"]], "Rivers supplied water essential for agriculture and daily life."),
      mcq(3, "Which river was central to Ancient Egypt?", "The Nile", [["The Amazon", "river-confusion"], ["The Mississippi", "river-confusion"]], "Ancient Egypt developed along the Nile River."),
      mcq(4, "Mesopotamia developed between which two rivers?", "The Tigris and Euphrates", [["The Nile and Amazon", "river-confusion"], ["The Ganges and Indus", "river-confusion"]], "Mesopotamia means 'land between rivers' — the Tigris and Euphrates."),
    ]),
  skill(6, 2, "ancient-greece-rome", "Ancient Greece and Rome", "Learn key contributions of Greek and Roman civilization.",
    `## Ancient Greece and Rome\nAncient Greece gave us early **democracy**. Ancient Rome built a huge empire and gave us laws, roads, and aqueducts that influence us today.`,
    [
      mcq(3, "Which ancient civilization is credited with developing early democracy?", "Ancient Greece", [["Ancient Rome", "civilization-contribution-confusion"], ["Ancient Egypt", "civilization-contribution-confusion"]], "Athens in Ancient Greece developed one of the first democracies."),
      mcq(3, "What did the Romans build to carry water across long distances?", "Aqueducts", [["Pyramids", "civilization-contribution-confusion"], ["Canals only", "civilization-contribution-confusion"]], "Roman aqueducts transported water using gravity across great distances."),
    ]),
  skill(7, 1, "world-geography", "World Geography", "Identify continents, oceans, and major geographic features.",
    `## World Geography\nThere are **7 continents** (Africa, Antarctica, Asia, Australia, Europe, North America, South America) and **5 oceans** (Pacific, Atlantic, Indian, Southern, Arctic).`,
    [
      mcq(3, "How many continents are there?", "7", [["5", "fact-recall-error"], ["9", "fact-recall-error"]], "There are 7 continents on Earth."),
      mcq(3, "Which is the largest ocean on Earth?", "The Pacific Ocean", [["The Atlantic Ocean", "geography-fact-confusion"], ["The Arctic Ocean", "geography-fact-confusion"]], "The Pacific Ocean is the largest and deepest ocean."),
      mcq(3, "Which continent is also a country?", "Australia", [["Asia", "geography-fact-confusion"], ["Africa", "geography-fact-confusion"]], "Australia is unique in being both a continent and a single country."),
    ]),
  skill(7, 2, "economics-basics", "Basic Economics", "Understand supply, demand, and trade.",
    `## Supply and Demand\nWhen **demand** (how much people want something) is high and **supply** (how much is available) is low, prices tend to rise. **Trade** lets countries exchange goods they have for goods they need.`,
    [
      mcq(4, "If a toy becomes very popular but there are only a few left, what usually happens to its price?", "It goes up", [["It goes down", "supply-demand-confusion"], ["It stays exactly the same", "supply-demand-confusion"]], "High demand and low supply usually push prices up."),
      mcq(3, "Why do countries trade with each other?", "To get goods and resources they don't have enough of", [["Because it is required by every country", "trade-purpose-confusion"], ["To avoid making anything themselves", "trade-purpose-confusion"]], "Trade lets countries obtain resources or goods they lack."),
    ]),
  skill(8, 1, "constitution", "The U.S. Constitution", "Understand the branches of government and checks and balances.",
    `## The U.S. Constitution\nThe Constitution created three branches of government:\n- **Legislative** (Congress) — makes laws\n- **Executive** (President) — enforces laws\n- **Judicial** (Courts) — interprets laws\n\nThis system of **checks and balances** keeps any one branch from becoming too powerful.`,
    [
      mcq(4, "Which branch of government makes laws?", "Legislative", [["Executive", "branch-function-confusion"], ["Judicial", "branch-function-confusion"]], "Congress (the legislative branch) is responsible for making laws."),
      mcq(4, "Which branch of government interprets laws and can rule them unconstitutional?", "Judicial", [["Executive", "branch-function-confusion"], ["Legislative", "branch-function-confusion"]], "The judicial branch (courts) interprets laws."),
      mcq(4, "What is the purpose of 'checks and balances'?", "To prevent any one branch from becoming too powerful", [["To make government slower for no reason", "checks-balances-misconception"], ["To let the president control everything", "checks-balances-misconception"]], "Checks and balances let each branch limit the power of the others."),
    ]),
  skill(8, 2, "civil-war", "The Civil War", "Understand causes and outcomes of the U.S. Civil War.",
    `## The Civil War\nThe U.S. Civil War (1861-1865) was fought mainly over **slavery** and states' rights, between the Union (North) and Confederacy (South). The Union's victory led to the abolition of slavery.`,
    [
      mcq(4, "What was a major cause of the Civil War?", "Disagreement over slavery", [["A disagreement over taxes on tea", "cause-confusion"], ["A war with Britain", "cause-confusion"]], "Slavery was the central issue dividing the North and South."),
      mcq(4, "Which side won the Civil War?", "The Union (North)", [["The Confederacy (South)", "outcome-confusion"], ["Neither side won", "outcome-confusion"]], "The Union defeated the Confederacy in 1865."),
      mcq(4, "What major change followed the Union's victory?", "Slavery was abolished", [["Slavery expanded", "outcome-confusion"], ["Nothing changed", "outcome-confusion"]], "The 13th Amendment abolished slavery after the war."),
    ]),
];
