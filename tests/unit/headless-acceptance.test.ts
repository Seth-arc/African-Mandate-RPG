import { beforeAll, describe, expect, it } from "vitest";

import {
  HEADLESS_GOLDEN_CASES,
  HEADLESS_GOLDEN_SEED,
  HEADLESS_SIM_IDS,
  HeadlessAcceptanceArtifactSchema,
  HeadlessScenarioOutcomeSchema,
  hashHeadlessAcceptanceArtifact,
  runHeadlessAcceptance,
  type HeadlessAcceptanceArtifact,
} from "@african-mandate/headless";

const clone = <T>(value: T): T => structuredClone(value);
const HEADLESS_ACCEPTANCE_TIMEOUT_MS = 240_000;

describe("independent SIM-01 through SIM-16 headless acceptance", () => {
  let artifact: HeadlessAcceptanceArtifact;

  beforeAll(async () => {
    artifact = await runHeadlessAcceptance();
  }, HEADLESS_ACCEPTANCE_TIMEOUT_MS);

  it("reports every independently-authored mandatory golden as PASS", () => {
    expect(artifact.seed).toBe(HEADLESS_GOLDEN_SEED);
    expect(artifact.outcomeReports.map(({ simId }) => simId)).toEqual(
      HEADLESS_SIM_IDS,
    );
    expect(artifact.outcomeReports).toHaveLength(16);
    expect(
      artifact.outcomeReports.every(({ status }) => status === "PASS"),
    ).toBe(true);
    expect(artifact.overallStatus).toBe("READY_FOR_REVIEW");
  });

  it("accounts for 50 deterministic four-month, three-action samples", () => {
    expect(artifact.difficultyCoverage).toEqual([
      expect.objectContaining({
        difficultyProfileId: "difficulty_test_only_standard_v1",
        requestedSamples: 50,
        completedSamples: 50,
        failedSamples: 0,
        turnsPerSample: 4,
        decisionsPerTurn: 3,
        commandCount: 800,
        aggregateHash:
          "a10c63c39627c5420391d367db69024179021e6956d8a051530a3d392ee00701",
      }),
    ]);
  });

  it("replays and reloads the fixed fixture byte-for-byte canonically", () => {
    expect(artifact.replay.commandIds).toHaveLength(16);
    expect(artifact.replay.matched).toBe(true);
    expect(artifact.replay.repeatRunHash).toBe(artifact.replay.firstRunHash);
    expect(artifact.replay.reloadHash).toBe(artifact.replay.firstRunHash);
    expect(artifact.replay.firstRunHash).toBe(
      "8b903e93b5f0ac00d1804fe385e018bc72e1e9b86f03d51fd3a94b5ee7f23f32",
    );
  });

  it("keeps unavailable production systems visible and blocked", () => {
    expect(artifact.productionGates.length).toBeGreaterThan(0);
    expect(
      artifact.productionGates.every(({ status }) => status === "BLOCKED"),
    ).toBe(true);
  });

  it("fails closed if a PASS report differs from its independent golden", () => {
    const tampered = clone(artifact.outcomeReports[0]!);
    tampered.observedObservableCodes = ["implementation_convenience"];
    expect(() => HeadlessScenarioOutcomeSchema.parse(tampered)).toThrow(
      /PASS requires exact golden observable equality/u,
    );
  });

  it("fails closed if a mandatory scenario report is omitted", () => {
    const tampered = clone(artifact);
    tampered.outcomeReports.pop();
    expect(() => HeadlessAcceptanceArtifactSchema.parse(tampered)).toThrow();
  });

  it("fails closed if fixed replay hashes diverge", () => {
    const tampered = clone(artifact);
    tampered.replay.repeatRunHash = "0".repeat(64);
    expect(() => HeadlessAcceptanceArtifactSchema.parse(tampered)).toThrow(
      /READY_FOR_REVIEW requires/u,
    );
  });

  it("pins the required negative-case observables in the golden inventory", () => {
    const codes = new Set(
      HEADLESS_GOLDEN_CASES.flatMap(
        ({ expectedObservableCodes }) => expectedObservableCodes,
      ),
    );
    for (const code of [
      "hidden_intent_absent",
      "missing_not_zero",
      "duplicate_classified",
      "oct_to_feb",
      "failed_write_uncommitted",
      "no_forced_case",
      "trace_order_stable",
    ]) {
      expect(codes.has(code), code).toBe(true);
    }
  });

  it(
    "produces a stable accepted-artifact hash",
    async () => {
      const repeated = await runHeadlessAcceptance();
      expect(hashHeadlessAcceptanceArtifact(repeated)).toBe(
        "47195790f1e7ba07285c8ef59b422045cfec6d2262e8999045f2d07231dc2fab",
      );
      expect(hashHeadlessAcceptanceArtifact(artifact)).toBe(
        hashHeadlessAcceptanceArtifact(repeated),
      );
    },
    HEADLESS_ACCEPTANCE_TIMEOUT_MS,
  );
});
