// lib/bars/validation.ts
// Pure input validation for the Competency BARS generator.

export interface BarsInput {
  competency: string;
  definition?: string;
  roleContext?: string;
  levels: number;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  value?: BarsInput;
}

export const MIN_LEVELS = 3;
export const MAX_LEVELS = 6;
export const MAX_COMPETENCY_LEN = 120;
export const MAX_DEFINITION_LEN = 1000;
export const MAX_ROLE_LEN = 200;

export function validateBarsInput(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof raw !== "object" || raw === null) {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const body = raw as Record<string, unknown>;

  const competency = typeof body.competency === "string" ? body.competency.trim() : "";
  if (competency.length < 2) {
    errors.push("Competency name is required (at least 2 characters).");
  } else if (competency.length > MAX_COMPETENCY_LEN) {
    errors.push(`Competency name must be ${MAX_COMPETENCY_LEN} characters or fewer.`);
  }

  const definition = typeof body.definition === "string" ? body.definition.trim() : "";
  if (definition.length > MAX_DEFINITION_LEN) {
    errors.push(`Definition must be ${MAX_DEFINITION_LEN} characters or fewer.`);
  }

  const roleContext = typeof body.roleContext === "string" ? body.roleContext.trim() : "";
  if (roleContext.length > MAX_ROLE_LEN) {
    errors.push(`Role/context must be ${MAX_ROLE_LEN} characters or fewer.`);
  }

  let levels = 5; // default
  if (body.levels !== undefined && body.levels !== null && body.levels !== "") {
    const parsed = Number(body.levels);
    if (!Number.isInteger(parsed)) {
      errors.push("Number of levels must be a whole number.");
    } else if (parsed < MIN_LEVELS || parsed > MAX_LEVELS) {
      errors.push(`Number of levels must be between ${MIN_LEVELS} and ${MAX_LEVELS}.`);
    } else {
      levels = parsed;
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, errors: [], value: { competency, definition, roleContext, levels } };
}
