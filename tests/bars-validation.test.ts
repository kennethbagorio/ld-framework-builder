import { describe, it, expect } from "vitest";
import { validateBarsInput } from "../lib/bars/validation";

describe("validateBarsInput", () => {
  it("accepts a valid competency with defaults", () => {
    const result = validateBarsInput({ competency: "Data Analysis" });
    expect(result.ok).toBe(true);
    expect(result.value?.competency).toBe("Data Analysis");
    expect(result.value?.levels).toBe(5);
  });

  it("rejects a too-short competency", () => {
    const result = validateBarsInput({ competency: "A" });
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects a non-object body", () => {
    expect(validateBarsInput("not an object").ok).toBe(false);
  });

  it("rejects levels outside the allowed range", () => {
    expect(validateBarsInput({ competency: "Testing", levels: 9 }).ok).toBe(false);
    expect(validateBarsInput({ competency: "Testing", levels: 1 }).ok).toBe(false);
  });

  it("trims whitespace and accepts an in-range level count", () => {
    const result = validateBarsInput({ competency: "  Communication  ", levels: 4 });
    expect(result.ok).toBe(true);
    expect(result.value?.competency).toBe("Communication");
    expect(result.value?.levels).toBe(4);
  });
});
