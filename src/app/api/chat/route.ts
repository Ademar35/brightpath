import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getActiveStudentId } from "@/lib/auth";
import { getBuddy } from "@/lib/buddies";
import { getClaude, CHAT_MODEL } from "@/lib/claude";

const schema = z.object({
  message: z.string().min(1).max(2000),
  mode: z.enum(["homework", "practice"]).default("homework"),
  questionContext: z
    .object({ prompt: z.string(), choices: z.array(z.string()) })
    .optional(),
});

const HISTORY_LIMIT = 12;

export async function POST(req: NextRequest) {
  const studentId = await getActiveStudentId();
  if (!studentId) return new Response("No active student", { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response("Invalid input", { status: 400 });
  const { message, mode, questionContext } = parsed.data;

  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
  const buddy = getBuddy(student.buddyId);

  const anthropic = getClaude();
  if (!anthropic) {
    return new Response(
      "I can't chat yet because my brain (the Anthropic API key) hasn't been set up by a grown-up. Ask them to add ANTHROPIC_API_KEY to the app's settings!",
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  await prisma.chatMessage.create({ data: { studentId, role: "user", content: message, mode } });

  const history = await prisma.chatMessage.findMany({
    where: { studentId, mode },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  history.reverse();

  let systemPrompt = buddy.systemPrompt(student.grade);
  if (questionContext) {
    systemPrompt += `\n\nCURRENT QUESTION the student is working on: "${questionContext.prompt}" with choices: ${questionContext.choices.join(", ")}. Ground your hints in this specific problem, but still never reveal the letter/option that is correct.`;
  }

  const messages = history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const encoder = new TextEncoder();
  let full = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const streamResp = anthropic.messages.stream({
          model: CHAT_MODEL,
          max_tokens: 400,
          system: systemPrompt,
          messages,
        });

        streamResp.on("text", (text) => {
          full += text;
          controller.enqueue(encoder.encode(text));
        });

        await streamResp.finalMessage();
        controller.close();

        if (full.trim()) {
          await prisma.chatMessage.create({ data: { studentId, role: "assistant", content: full, mode } });
        }
      } catch (err) {
        console.error("Chat stream error:", err);
        const fallback = `${buddy.avatar} Oops, my thoughts got a little scrambled! Can you try asking that again?`;
        controller.enqueue(encoder.encode(fallback));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function GET(req: NextRequest) {
  const studentId = await getActiveStudentId();
  if (!studentId) return new Response("No active student", { status: 401 });
  const mode = (req.nextUrl.searchParams.get("mode") as "homework" | "practice") ?? "homework";

  const history = await prisma.chatMessage.findMany({
    where: { studentId, mode },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return Response.json({ messages: history.map((h) => ({ role: h.role, content: h.content })) });
}
