// lib/objectives/parse.ts
// Pure parsing/validation of the LLM response for the objectives builder.

import { extractJson } from "../json";

export interface LearningObjective {
  id: number;
  text: string;
  bloomLevel: string;
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  rationale: string;
}

export interface ObjectivesResult {
  topic: string;
  objectives: LearningObjective[];
  assessment: AssessmentQuestion[];
}

export function parseObjectivesResponse(text: string): ObjectivesResult {
  const json = extractJson(text);

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("Model returned invalid JSON.");
  }

  const obj = data as Record<string, unknown>;
  const topic = typeof obj.topic === "string" ? obj.topic : "";

  if (!Array.isArray(obj.objectives) || obj.objectives.length === 0) {
    throw new Error("Model response is missing the 'objectives' array.");
  }
  if (!Array.isArray(obj.assessment) || obj.assessment.length === 0) {
    throw new Error("Model response is missing the 'assessment' array.");
  }

  const objectives: LearningObjective[] = obj.objectives.map((raw, index) => {
    const o = raw as Record<string, unknown>;
    const text = typeof o.text === "string" ? o.text.trim() : "";
    if (!text) throw new Error(`Objective ${index + 1} has no text.`);
    return {
      id: Number.isInteger(o.id) ? (o.id as number) : index + 1,
      text,
      bloomLevel: typeof o.bloomLevel === "string" ? o.bloomLevel : "",
    };
  });

  const assessment: AssessmentQuestion[] = obj.assessment.map((raw, index) => {
    const q = raw as Record<string, unknown>;
    const question = typeof q.question === "string" ? q.question.trim() : "";
    if (!question) throw new Error(`Question ${index + 1} has no text.`);
    const options = Array.isArray(q.options)
      ? q.options.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];
    if (options.length < 2) {
      throw new Error(`Question ${index + 1} needs at least 2 options.`);
    }
    let answerIndex = Number.isInteger(q.answerIndex) ? (q.answerIndex as number) : 0;
    if (answerIndex < 0 || answerIndex >= options.length) answerIndex = 0;
    return {
      question,
      options,
      answerIndex,
      rationale: typeof q.rationale === "string" ? q.rationale : "",
    };
  });

  return { topic, objectives, assessment };
}
