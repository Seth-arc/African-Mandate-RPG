import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { COLLECTION_NARRATIVE_OUTCOMES } from "@african-mandate/narrative";
import {
  HumanApprovalRegisterSchema,
  auditEditorialCopy,
  auditTokenReferences,
} from "@african-mandate/tooling";

const read = (path: string) => readFileSync(path, "utf8");

describe("Prompt 24 editorial QA contract", () => {
  it("keeps all deterministic collection template outcomes available", () => {
    expect([...COLLECTION_NARRATIVE_OUTCOMES].sort()).toEqual([
      "contested",
      "delayed",
      "failed",
      "inconclusive",
      "partial",
      "useful",
    ]);
  });

  it("rejects prohibited copy and reports clean fixture copy", () => {
    const negative = auditEditorialCopy([
      {
        sourceId: "negative",
        text: "Oops! Observers say you unlocked a powerful victory.",
      },
    ]);
    expect(negative.failures.map(({ ruleId }) => ruleId)).toEqual(
      expect.arrayContaining([
        "COPY_GENERIC_ERROR",
        "COPY_UNNAMED_AUTHORITY",
        "COPY_GAMIFICATION",
      ]),
    );
    expect(negative.reviews.map(({ ruleId }) => ruleId)).toEqual(
      expect.arrayContaining(["COPY_EXCLAMATION", "COPY_MARKETING_LANGUAGE"]),
    );

    const fixture = JSON.parse(
      read("apps/web/src/test-map-document-artifact.json"),
    ) as unknown;
    const result = auditEditorialCopy([
      { sourceId: "map-fixture", text: JSON.stringify(fixture) },
    ]);
    expect(result.failures).toEqual([]);
    expect(result.reviews).toEqual([]);
  });

  it("resolves every component token and detects an undefined token", () => {
    const tokens = read("docs/tokens.css");
    const components = read("packages/ui/src/styles.css");
    expect(auditTokenReferences(tokens, components)).toEqual([]);
    expect(
      auditTokenReferences(tokens, ".bad { color: var(--missing-token); }"),
    ).toEqual(["--missing-token"]);
  });

  it("keeps every unrun human review visibly pending or blocked", () => {
    const register = HumanApprovalRegisterSchema.parse(
      JSON.parse(read("docs/build/EDITORIAL_APPROVAL_REGISTER.json")),
    );
    expect(register.entries).toHaveLength(5);
    expect(register.entries.every(({ status }) => status !== "APPROVED")).toBe(
      true,
    );

    expect(() =>
      HumanApprovalRegisterSchema.parse({
        ...register,
        entries: register.entries.map((entry, index) =>
          index === 0
            ? { ...entry, status: "APPROVED", missingEvidence: [] }
            : entry,
        ),
      }),
    ).toThrow(/named, dated reviewer/u);
  });
});
