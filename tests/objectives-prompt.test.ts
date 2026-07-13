import { describe, it, expect } from "vitest";
import { buildObjectivesPrompt, OBJECTIVES_SYSTEM_PROMPT } from "../lib/objectives/prompt";
import { parseObjectivesResponse } from "../lib/objectives/parse";

describe("buildObjectivesPrompt", () => {
  const base = { topic: "PON fibre architecture", objectiveCount: 4, questionCount: 4 };

  it("includes the topic", () => {
    expect(buildObjectivesPrompt(base)).toContain("PON fibre architecture");
  });

  it("requests the exact counts", () => {
    const prompt = buildObjectivesPrompt({ ...base, objectiveCount: 3, questionCount: 6 });
    expect(prompt).toContain("exactly 3 SMART learning objectives");
    expect(prompt).toContain("exactly 6 multiple-choice");
  });

  it("includes optional audience", () => {
    expect(buildObjectivesPrompt({ ...base, audience: "New designers" })).toContain(
      "New designers"
    );
  });

  it("exports a non-empty system prompt", () => {
    expect(OBJECTIVES_SYSTEM_PROMPT.length).toBeGreaterThan(20);
  });
});

const validJson = JSON.stringify({
  topic: "Fibre basics",
  objectives: [
    { id: 1, text: "Identify the components of a PON.", bloomLevel: "Remember" },
    { id: 2, text: "Apply splice-loss budgets to a design.", bloomLevel: "Apply" },
  ],
  assessment: [
    {
      question: "What does PON stand for?",
      options: ["Passive Optical Network", "Public Optical Node", "Private Optic Net", "None"],
      answerIndex: 0,
      rationale: "PON = Passive Optical Network.",
    },
  ],
});

describe("parseObjectivesResponse", () => {
  it("parses valid objectives and assessment", () => {
    const result = parseObjectivesResponse(validJson);
    expect(result.objectives).toHaveLength(2);
    expect(result.assessment).toHaveLength(1);
    expect(result.assessment[0].answerIndex).toBe(0);
  });

  it("throws when objectives are missing", () => {
    const bad = JSON.stringify({ topic: "X", assessment: [] });
    expect(() => parseObjectivesResponse(bad)).toThrow();
  });

  it("throws when a question has fewer than 2 options", () => {
    const bad = JSON.stringify({
      topic: "X",
      objectives: [{ id: 1, text: "Do a thing", bloomLevel: "Apply" }],
      assessment: [{ question: "Q?", options: ["only one"], answerIndex: 0, rationale: "" }],
    });
    expect(() => parseObjectivesResponse(bad)).toThrow();
  });
});
