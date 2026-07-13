// app/api/bars/route.ts
import { NextResponse } from "next/server";
import { validateBarsInput } from "@/lib/bars/validation";
import { buildBarsPrompt, BARS_SYSTEM_PROMPT } from "@/lib/bars/prompt";
import { parseBarsResponse } from "@/lib/bars/parse";
import { callLlm } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateBarsInput(body);
  if (!validation.ok || !validation.value) {
    return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
  }

  try {
    const prompt = buildBarsPrompt(validation.value);
    const raw = await callLlm({ system: BARS_SYSTEM_PROMPT, prompt });
    const result = parseBarsResponse(raw);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    console.error("BARS generation failed:", message);
    return NextResponse.json(
      { error: "Could not generate the rating scale. Please try again." },
      { status: 500 }
    );
  }
}
