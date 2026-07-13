// lib/llm.ts
// Provider-agnostic LLM caller. Reads credentials from environment variables
// at REQUEST time (never hardcoded, never bundled into the client).
//
// Set ONE of these in your environment (.env.local for dev, Vercel dashboard
// for production):
//   ANTHROPIC_API_KEY=...   (Claude)
//   OPENAI_API_KEY=...      (OpenAI)
// Optionally override the model with MODEL=...

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export interface LlmOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
}

/**
 * Decide which provider to use based on which key is present.
 * Anthropic is preferred if both happen to be set.
 */
export function resolveProvider(env: NodeJS.ProcessEnv = process.env):
  | { provider: "anthropic"; apiKey: string; model: string; baseUrl: string }
  | { provider: "openai"; apiKey: string; model: string; baseUrl: string }
  | { provider: "none" } {
  const trim = (u: string) => u.replace(/\/$/, "");
  if (env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.MODEL || DEFAULT_ANTHROPIC_MODEL,
      baseUrl: trim(env.ANTHROPIC_BASE_URL || "https://api.anthropic.com"),
    };
  }
  if (env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: env.OPENAI_API_KEY,
      model: env.MODEL || DEFAULT_OPENAI_MODEL,
      // Most keys use the standard endpoint. Some course labs proxy OpenAI
      // through a custom URL — set OPENAI_BASE_URL if yours does.
      baseUrl: trim(env.OPENAI_BASE_URL || "https://api.openai.com/v1"),
    };
  }
  return { provider: "none" };
}

export async function callLlm({ system, prompt, maxTokens = 2000 }: LlmOptions): Promise<string> {
  const resolved = resolveProvider();

  if (resolved.provider === "none") {
    throw new Error(
      "No API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in your environment."
    );
  }

  if (resolved.provider === "anthropic") {
    const res = await fetch(`${resolved.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": resolved.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: resolved.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${detail.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n");
    if (!text) throw new Error("Anthropic API returned an empty response.");
    return text;
  }

  // OpenAI
  const res = await fetch(`${resolved.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${resolved.apiKey}`,
    },
    body: JSON.stringify({
      model: resolved.model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI API returned an empty response.");
  return text;
}
