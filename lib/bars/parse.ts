// lib/bars/parse.ts
// Pure parsing/validation of the LLM response for the BARS generator.

import { extractJson } from "../json";

export interface BarsLevel {
  level: number;
  label: string;
  anchors: string[];
}

export interface BarsResult {
  competency: string;
  levels: BarsLevel[];
}

export function parseBarsResponse(text: string): BarsResult {
  const json = extractJson(text);

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("Model returned invalid JSON.");
  }

  const obj = data as Record<string, unknown>;
  const competency = typeof obj.competency === "string" ? obj.competency : "";

  if (!Array.isArray(obj.levels) || obj.levels.length === 0) {
    throw new Error("Model response is missing the 'levels' array.");
  }

  const levels: BarsLevel[] = obj.levels.map((raw, index) => {
    const lvl = raw as Record<string, unknown>;
    const level = Number.isInteger(lvl.level) ? (lvl.level as number) : index + 1;
    const label = typeof lvl.label === "string" ? lvl.label : `Level ${level}`;
    const anchors = Array.isArray(lvl.anchors)
      ? lvl.anchors.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
      : [];
    if (anchors.length === 0) {
      throw new Error(`Level ${level} has no behavioural anchors.`);
    }
    return { level, label, anchors };
  });

  return { competency, levels };
}
