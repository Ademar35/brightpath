import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getClaude(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  if (!client) client = new Anthropic({ apiKey: key });
  return client;
}

export const CHAT_MODEL = "claude-sonnet-5";
export const TAGGING_MODEL = "claude-haiku-4-5-20251001";
