// lib/objectives/prompt.ts
// Pure prompt construction for the Learning Objective & Micro-Assessment builder.

import type { ObjectivesInput } from "./validation";

export const OBJECTIVES_SYSTEM_PROMPT =
  "You are an expert instructional designer. You write SMART learning objectives " +
  "(Specific, Measurable, Achievable, Relevant, Time-bound) using observable action " +
  "verbs from Bloom's taxonomy, and you design short multiple-choice micro-assessment " +
  "questions that directly test those objectives. Objectives must start with a measurable " +
  "verb (e.g. 'Identify', 'Apply', 'Analyse'), never vague verbs like 'understand' or 'know'.";

export function buildObjectivesPrompt(input: ObjectivesInput): string {
  const { topic, audience, objectiveCount, questionCount } = input;

  const lines: string[] = [];
  lines.push(`Design learning content for the training topic: "${topic}".`);
  if (audience) {
    lines.push(`Target audience: ${audience}.`);
  }
  lines.push(
    `Write exactly ${objectiveCount} SMART learning objectives. Each objective must begin ` +
      `with a measurable Bloom's-taxonomy action verb and be a single sentence. Tag each ` +
      `objective with its Bloom level (Remember, Understand, Apply, Analyse, Evaluate, or Create).`
  );
  lines.push(
    `Then write exactly ${questionCount} multiple-choice micro-assessment questions that test ` +
      `those objectives. Each question has 4 options, exactly one correct answer (as a 0-based ` +
      `index), and a one-sentence rationale for the correct answer.`
  );
  lines.push(
    "Return ONLY valid JSON, no markdown, no commentary, no code fences. Use exactly this schema:"
  );
  lines.push(
    JSON.stringify(
      {
        topic: "string",
        objectives: [{ id: 1, text: "string", bloomLevel: "string" }],
        assessment: [
          {
            question: "string",
            options: ["string", "string", "string", "string"],
            answerIndex: 0,
            rationale: "string",
          },
        ],
      },
      null,
      2
    )
  );

  return lines.join("\n\n");
}
