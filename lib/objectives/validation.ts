// lib/objectives/validation.ts
// Pure input validation for the Learning Objective & Micro-Assessment builder.

export interface ObjectivesInput {
  topic: string;
  audience?: string;
  objectiveCount: number;
  questionCount: number;
}

export interface ObjectivesValidationResult {
  ok: boolean;
  errors: string[];
  value?: ObjectivesInput;
}

export const MIN_OBJECTIVES = 2;
export const MAX_OBJECTIVES = 6;
export const MIN_QUESTIONS = 2;
export const MAX_QUESTIONS = 8;
export const MAX_TOPIC_LEN = 120;
export const MAX_AUDIENCE_LEN = 200;

function validateCount(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  label: string,
  errors: string[]
): number {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    errors.push(`${label} must be a whole number.`);
    return fallback;
  }
  if (parsed < min || parsed > max) {
    errors.push(`${label} must be between ${min} and ${max}.`);
    return fallback;
  }
  return parsed;
}

export function validateObjectivesInput(raw: unknown): ObjectivesValidationResult {
  const errors: string[] = [];

  if (typeof raw !== "object" || raw === null) {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const body = raw as Record<string, unknown>;

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (topic.length < 2) {
    errors.push("Training topic is required (at least 2 characters).");
  } else if (topic.length > MAX_TOPIC_LEN) {
    errors.push(`Topic must be ${MAX_TOPIC_LEN} characters or fewer.`);
  }

  const audience = typeof body.audience === "string" ? body.audience.trim() : "";
  if (audience.length > MAX_AUDIENCE_LEN) {
    errors.push(`Audience must be ${MAX_AUDIENCE_LEN} characters or fewer.`);
  }

  const objectiveCount = validateCount(
    body.objectiveCount, 4, MIN_OBJECTIVES, MAX_OBJECTIVES, "Number of objectives", errors
  );
  const questionCount = validateCount(
    body.questionCount, 4, MIN_QUESTIONS, MAX_QUESTIONS, "Number of questions", errors
  );

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, errors: [], value: { topic, audience, objectiveCount, questionCount } };
}
