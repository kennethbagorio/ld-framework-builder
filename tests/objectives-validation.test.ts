import { describe, it, expect } from "vitest";
import { validateObjectivesInput } from "../lib/objectives/validation";

describe("validateObjectivesInput", () => {
  it("accepts a valid topic with defaults", () => {
    const result = validateObjectivesInput({ topic: "PON fibre architecture" });
    expect(result.ok).toBe(true);
    expect(result.value?.objectiveCount).toBe(4);
    expect(result.value?.questionCount).toBe(4);
  });

  it("rejects a too-short topic", () => {
    expect(validateObjectivesInput({ topic: "A" }).ok).toBe(false);
  });

  it("rejects an objective count outside range", () => {
    expect(validateObjectivesInput({ topic: "Fibre", objectiveCount: 99 }).ok).toBe(false);
  });

  it("rejects a question count outside range", () => {
    expect(validateObjectivesInput({ topic: "Fibre", questionCount: 1 }).ok).toBe(false);
  });

  it("accepts valid counts and trims the topic", () => {
    const result = validateObjectivesInput({
      topic: "  Splicing basics  ",
      objectiveCount: 3,
      questionCount: 5,
    });
    expect(result.ok).toBe(true);
    expect(result.value?.topic).toBe("Splicing basics");
    expect(result.value?.objectiveCount).toBe(3);
    expect(result.value?.questionCount).toBe(5);
  });
});
