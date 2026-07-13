// lib/json.ts
// Shared helper: pull a JSON object out of raw LLM text, tolerating code fences
// and stray commentary. Pure — no network.

export function extractJson(text: string): string {
  if (typeof text !== "string") {
    throw new Error("Model response was not text.");
  }
  let cleaned = text.trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in the model response.");
  }
  return cleaned.slice(first, last + 1);
}
