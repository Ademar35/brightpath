import { PrismaClient } from "@prisma/client";
import { mathSkills } from "../src/data/curriculum/math";
import { readingSkills } from "../src/data/curriculum/reading";
import { scienceSkills } from "../src/data/curriculum/science";
import { socialSkills } from "../src/data/curriculum/social";
import { SkillDef } from "../src/data/curriculum/types";

const prisma = new PrismaClient();

const allSkills: SkillDef[] = [...mathSkills, ...readingSkills, ...scienceSkills, ...socialSkills];

async function main() {
  console.log(`Seeding ${allSkills.length} skills...`);

  for (const s of allSkills) {
    await prisma.skill.upsert({
      where: { id: s.id },
      update: {
        subject: s.subject,
        grade: s.grade,
        order: s.order,
        name: s.name,
        description: s.description,
        lesson: s.lesson,
        prereqIds: s.prereqIds.join(","),
      },
      create: {
        id: s.id,
        subject: s.subject,
        grade: s.grade,
        order: s.order,
        name: s.name,
        description: s.description,
        lesson: s.lesson,
        prereqIds: s.prereqIds.join(","),
      },
    });

    const existing = await prisma.question.count({ where: { skillId: s.id } });
    if (existing > 0) continue; // don't regenerate if already seeded

    const questions = s.generate();
    if (questions.length === 0) {
      console.warn(`  WARNING: ${s.id} generated 0 questions`);
      continue;
    }
    await prisma.question.createMany({
      data: questions.map((q) => ({
        skillId: s.id,
        difficulty: q.difficulty,
        prompt: q.prompt,
        choices: JSON.stringify(q.choices),
        answerIndex: q.answerIndex,
        explanation: q.explanation,
        misconceptions: JSON.stringify(q.misconceptions),
      })),
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
