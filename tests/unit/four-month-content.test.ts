import { describe, expect, it } from "vitest";

import {
  assertFourMonthContentPublishable,
  compileFourMonthTestContent,
  FourMonthTestContentArtifactSchema,
  TestOnlyContentPublicationError,
} from "@african-mandate/content";
import {
  ProductionScenarioAdmissionError,
  serializeProductionScenarioBundle,
} from "@african-mandate/data-pipeline";
import { hashCanonicalJson } from "@african-mandate/simulation";

const EXPECTED_ACTION_IDS = [
  "action_m01_task_access_verification",
  "action_m01_consult_mali_access",
  "action_m01_task_civilian_route",
  "action_m01_request_asset_validation",
  "action_m01_consult_au_commission",
  "action_m01_adopt_access_assessment",
  "action_m02_consult_civic_channel",
  "action_m02_open_access_case",
  "action_m02_consult_aes_liaison",
  "action_m02_consult_ocha",
  "action_m03_negotiate_monitoring_terms",
  "action_m03_open_civilian_case",
  "action_m03_open_corridor_case",
  "action_m03_consult_afdb",
  "action_m04_revise_assessment",
  "action_m04_revise_case_scope",
  "action_m04_seek_authorization",
  "action_m04_reallocate_priority",
] as const;

const clone = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe("four-month TEST_ONLY compiled content", () => {
  it("compiles a strict full scenario bundle and audits all 18 authoring IDs", () => {
    const artifact = compileFourMonthTestContent();
    const ids = artifact.authoringActionAudit.map(({ actionId }) => actionId);
    expect(ids).toEqual(EXPECTED_ACTION_IDS);
    expect(new Set(ids).size).toBe(18);
    expect(
      artifact.authoringActionAudit.filter(
        ({ status }) => status === "executable_test_only",
      ),
    ).toHaveLength(15);
    expect(
      artifact.authoringActionAudit.filter(
        ({ status }) => status === "blocked_unimplemented_canonical_system",
      ),
    ).toMatchObject([
      { actionId: "action_m03_consult_afdb" },
      { actionId: "action_m04_seek_authorization" },
      { actionId: "action_m04_reallocate_priority" },
    ]);
    expect(Object.keys(artifact.scenarioBundle.actionDefinitions)).toHaveLength(
      15,
    );
  });

  it("pins the three-slot economy across four ordered months", () => {
    const artifact = compileFourMonthTestContent();
    expect(artifact.scenarioBundle.scenario.decisionsPerTurn).toBe(3);
    expect(artifact.monthlyAvailability.map(({ month }) => month)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(
      artifact.monthlyAvailability.map(
        ({ authoringActionIds }) => authoringActionIds.length,
      ),
    ).toEqual([6, 4, 4, 4]);
    for (const branch of artifact.branches) {
      for (const month of branch.months) {
        expect(month.decisionSlots).toHaveLength(3);
        expect(
          month.decisionSlots.filter(
            ({ disposition }) => disposition === "action",
          ).length,
        ).toBeLessThanOrEqual(3);
      }
    }
  });

  it("keeps collect, consult, and defer/redirect as distinct meaningful paths", () => {
    const artifact = compileFourMonthTestContent();
    const [branchA, branchB, branchC] = artifact.branches;
    expect(branchA).toMatchObject({ branchId: "A", strategy: "collect_first" });
    expect(branchB).toMatchObject({ branchId: "B", strategy: "consult_first" });
    expect(branchC).toMatchObject({
      branchId: "C",
      strategy: "defer_redirect",
    });
    expect(branchA?.months[0].decisionSlots[0]).toMatchObject({
      disposition: "action",
      actionId: "action_m01_task_access_verification",
    });
    expect(branchB?.months[0].decisionSlots[0]).toMatchObject({
      disposition: "action",
      actionId: "action_m01_consult_mali_access",
    });
    expect(
      branchC?.months
        .flatMap(({ decisionSlots }) => decisionSlots)
        .some(({ disposition }) => disposition === "unused_defer"),
    ).toBe(true);
    expect(new Set(artifact.branches.map(({ branchId }) => branchId))).toEqual(
      new Set(["A", "B", "C"]),
    );
  });

  it("aliases the inconsistent civilian-route gap without creating a second gap", () => {
    const artifact = compileFourMonthTestContent();
    expect(artifact.gapAliases).toEqual([
      expect.objectContaining({
        alias: "gap_m01_civilian_route",
        canonicalId: "gap_m01_civilian_access",
      }),
    ]);
    expect(
      Object.values(artifact.initialPlayerKnowledge.intelligenceGaps).some(
        ({ intelligenceGapId }) =>
          intelligenceGapId === "gap_m01_civilian_route",
      ),
    ).toBe(false);
    expect(
      Object.values(artifact.initialPlayerKnowledge.intelligenceGaps).some(
        ({ intelligenceGapId }) =>
          intelligenceGapId === "gap_m01_civilian_access",
      ),
    ).toBe(true);
  });

  it("contains only simulated/test sources and no fabricated real observations", () => {
    const artifact = compileFourMonthTestContent();
    expect(
      artifact.sourceStreams.every(
        (stream) =>
          !stream.containsHistoricalObservations &&
          !stream.containsRealPersonClaims,
      ),
    ).toBe(true);
    expect(
      Object.values(artifact.initialPlayerKnowledge.evidence).some(
        ({ sourceType }) => sourceType === "observed_baseline",
      ),
    ).toBe(false);
    expect(Object.keys(artifact.scenarioBundle.assetDefinitions)).toEqual([]);
    expect(Object.keys(artifact.scenarioBundle.corridorDefinitions)).toEqual(
      [],
    );
    expect(
      artifact.messages.every(
        ({ bodyTemplate, containsHistoricalObservation }) =>
          bodyTemplate.startsWith("SIMULATED") &&
          !containsHistoricalObservation,
      ),
    ).toBe(true);
  });

  it("is byte-stable under canonical hashing", () => {
    const first = compileFourMonthTestContent();
    const second = compileFourMonthTestContent();
    expect(hashCanonicalJson(first)).toBe(hashCanonicalJson(second));
    expect(hashCanonicalJson(first)).toBe(
      "c9a12875cf70933777ef3d4d45a7a4f6bb0d332524364afc10561bc62751d8ac",
    );
  });

  it("rejects duplicate IDs, dangling branches, and dangling gap aliases", () => {
    const artifact = compileFourMonthTestContent();

    const duplicate = clone(artifact) as {
      authoringActionAudit: Array<Record<string, unknown>>;
    };
    duplicate.authoringActionAudit[1] = duplicate.authoringActionAudit[0]!;
    expect(() => FourMonthTestContentArtifactSchema.parse(duplicate)).toThrow(
      /Duplicate authoring action ID/u,
    );

    const danglingBranch = clone(artifact) as {
      branches: Array<{
        months: Array<{
          decisionSlots: Array<Record<string, unknown>>;
        }>;
      }>;
    };
    danglingBranch.branches[0]!.months[0]!.decisionSlots[0] = {
      slot: 1,
      disposition: "action",
      actionId: "action_unknown_test_only",
    };
    expect(() =>
      FourMonthTestContentArtifactSchema.parse(danglingBranch),
    ).toThrow(/Branch references non-executable action/u);

    const danglingAlias = clone(artifact) as {
      gapAliases: Array<Record<string, unknown>>;
    };
    danglingAlias.gapAliases[0] = {
      alias: "gap_m01_civilian_route",
      canonicalId: "gap_unknown_test_only",
      reason: "test mutation",
    };
    expect(() =>
      FourMonthTestContentArtifactSchema.parse(danglingAlias),
    ).toThrow(/Gap alias target is not in initial knowledge/u);
  });

  it("hard-rejects direct and generic production publication", () => {
    const artifact = compileFourMonthTestContent();
    expect(() => assertFourMonthContentPublishable(artifact)).toThrow(
      TestOnlyContentPublicationError,
    );
    expect(() =>
      serializeProductionScenarioBundle(artifact.scenarioBundle),
    ).toThrow(ProductionScenarioAdmissionError);
    expect(artifact.productionGate).toMatchObject({
      publishable: false,
      result: "REJECTED_TEST_ONLY",
    });
  });
});
