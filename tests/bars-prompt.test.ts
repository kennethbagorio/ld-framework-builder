import { describe, it, expect } from "vitest";
import { buildBarsPrompt, BARS_SYSTEM_PROMPT } from "../lib/bars/prompt";

describe("buildBarsPrompt", () => {
  const base = { competency: "Stakeholder Management", levels: 5 };

  it("includes the competency name", () => {
    expect(buildBarsPrompt(base)).toContain("Stakeholder Management");
  });

  it("requests the exact number of levels", () => {
    expect(buildBarsPrompt({ ...base, levels: 4 })).toContain("exactly 4 proficiency levels");
  });

  it("includes optional definition and role context", () => {
    const prompt = buildBarsPrompt({
      ...base,
      definition: "Managing internal and external partners",
      roleContext: "QC Lead",
    });
    expect(prompt).toContain("Managing internal and external partners");
    expect(prompt).toContain("QC Lead");
  });

  it("instructs JSON-only output", () => {
    expect(buildBarsPrompt(base).toLowerCase()).toContain("only valid json");
  });

  it("exports a non-empty system prompt", () => {
    expect(BARS_SYSTEM_PROMPT.length).toBeGreaterThan(20);
  });
});
