// lib/bars/prompt.ts
// Pure prompt construction for the Competency BARS generator.

import type { BarsInput } from "./validation";

export const BARS_SYSTEM_PROMPT =
  "You are an expert Learning & Development consultant who designs competency " +
  "frameworks. You write Behaviourally Anchored Rating Scales (BARS): concrete, " +
  "observable behavioural statements for each proficiency level. Anchors must be " +
  "specific and observable, never vague adjectives like 'good' or 'strong'. " +
  "Each level should describe what a person actually DOES at that proficiency.";

export function buildBarsPrompt(input: BarsInput): string {
  const { competency, definition, roleContext, levels } = input;

  const lines: string[] = [];
  lines.push(
    `Create a Behaviourally Anchored Rating Scale (BARS) for the competency: "${competency}".`
  );
  if (definition) {
    lines.push(`Competency definition/context provided by the user: ${definition}`);
  }
  if (roleContext) {
    lines.push(`This scale is for the following role/context: ${roleContext}`);
  }
  lines.push(
    `Produce exactly ${levels} proficiency levels, from level 1 (lowest) to level ${levels} (highest).`
  );
  lines.push(
    "For each level provide: a short label (e.g. Novice, Developing, Proficient, Advanced, Expert) " +
      "and 2 to 3 observable behavioural anchor statements written in the present tense."
  );
  lines.push(
    "Return ONLY valid JSON, no markdown, no commentary, no code fences. Use exactly this schema:"
  );
  lines.push(
    JSON.stringify(
      {
        competency: "string",
        levels: [{ level: 1, label: "string", anchors: ["string", "string"] }],
      },
      null,
      2
    )
  );

  return lines.join("\n\n");
}
