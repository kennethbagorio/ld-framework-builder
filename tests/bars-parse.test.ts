import { describe, it, expect } from "vitest";
import { parseBarsResponse } from "../lib/bars/parse";
import { extractJson } from "../lib/json";

const validJson = JSON.stringify({
  competency: "Data Analysis",
  levels: [
    { level: 1, label: "Novice", anchors: ["Follows steps with guidance"] },
    { level: 2, label: "Proficient", anchors: ["Works independently", "Spots errors"] },
  ],
});

describe("extractJson", () => {
  it("returns clean JSON unchanged", () => {
    expect(extractJson(validJson)).toContain("Data Analysis");
  });

  it("strips markdown code fences", () => {
    const fenced = "```json\n" + validJson + "\n```";
    expect(() => JSON.parse(extractJson(fenced))).not.toThrow();
  });

  it("throws when no JSON object is present", () => {
    expect(() => extractJson("no json here")).toThrow();
  });
});

describe("parseBarsResponse", () => {
  it("parses a valid response into typed levels", () => {
    const result = parseBarsResponse(validJson);
    expect(result.competency).toBe("Data Analysis");
    expect(result.levels).toHaveLength(2);
    expect(result.levels[1].anchors).toHaveLength(2);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseBarsResponse("{ not valid json")).toThrow();
  });

  it("throws when a level has no anchors", () => {
    const bad = JSON.stringify({
      competency: "X",
      levels: [{ level: 1, label: "Novice", anchors: [] }],
    });
    expect(() => parseBarsResponse(bad)).toThrow();
  });
});
