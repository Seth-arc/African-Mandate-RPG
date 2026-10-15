import { describe, expect, it } from "vitest";

import { productionScenarioConfiguration } from "@african-mandate/content";
import {
  EVALUATION_DIMENSIONS,
  ProductionEvaluationRequestSchema,
  ProductionScenarioConfigurationSchema,
  SimulatedAuthorizationProgressSchema,
} from "@african-mandate/domain";
import {
  evaluateSimulatedCampaign,
  hashCanonicalJson,
  resolveSimulatedAuthorization,
} from "@african-mandate/simulation";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const evaluationRequest = (values: readonly number[], harm = 0) =>
  ProductionEvaluationRequestSchema.parse({
    profile: productionScenarioConfiguration.evaluation,
    snapshots: values.map((value, index) => ({
      turn: index + 1,
      security: value,
      civilianOutcomes: value,
      regionalStability: value,
      institutionalCohesion: value,
      legitimacy: value,
      mandateSustainability: value,
    })),
    countervailingHarms: {
      security: harm,
      civilianOutcomes: harm,
      regionalStability: harm,
      institutionalCohesion: harm,
      legitimacy: harm,
      mandateSustainability: harm,
    },
    causalChains: [],
  });

describe("production simulated scenario policy", () => {
  it("publishes one versioned, owner-approved and visibly simulated configuration", () => {
    const parsed = ProductionScenarioConfigurationSchema.parse(
      productionScenarioConfiguration,
    );

    expect(parsed).toMatchObject({
      schemaVersion: 1,
      contractVersion: "1.0.0",
      classification: "PRODUCTION_SIMULATED_INSTITUTIONAL_MODEL",
      approval: {
        decisionId: "AM-GOV-062",
        reviewMode: "OWNER_ONLY_INDIVIDUAL_BUILD",
      },
      competitiveLeaderboard: {
        enabled: false,
        reasonCode: "OWNER_DISABLED_NONCOMPETITIVE_RELEASE",
      },
      sourceClaims: [],
      usesTestFixtureValues: false,
    });
    expect(parsed.disclosure).toMatch(/^SIMULATED:/u);
    expect(
      parsed.institutionRoles.every(
        ({ disclosure, historicalClaim }) =>
          disclosure.startsWith("SIMULATED:") && !historicalClaim,
      ),
    ).toBe(true);
    expect(JSON.stringify(parsed)).not.toMatch(/TEST[_-]?ONLY/iu);
    expect(hashCanonicalJson(parsed)).toBe(
      "ab4ccb03b7b638c62f37c27111a2bd27cd156008d2b8b4e8bcad7c5ecb42d904",
    );
  });

  it("keeps AES and ECOWAS as consultation roles, never authorization authorities", () => {
    for (const procedure of productionScenarioConfiguration.authorizationProcedures) {
      expect(procedure.legalClaim).toBe(false);
      expect(procedure.consultedInstitutionIds).toEqual(
        expect.arrayContaining(["institution_aes", "institution_ecowas"]),
      );
      expect(procedure.authorityInstitutionIds).not.toContain(
        "institution_aes",
      );
      expect(procedure.authorityInstitutionIds).not.toContain(
        "institution_ecowas",
      );
      expect(procedure.authorityInstitutionIds).toContain("institution_au_psc");
    }
  });

  it("resolves the fictional procedure only after every step and its lead time", () => {
    const procedure =
      productionScenarioConfiguration.authorizationProcedures[0]!;
    const pending = resolveSimulatedAuthorization(
      SimulatedAuthorizationProgressSchema.parse({
        procedure,
        requestedTurn: 4,
        currentTurn: 4,
        completedSteps: ["commission_submission"],
      }),
    );
    expect(pending).toMatchObject({
      status: "pending",
      reasonCode: "MISSING_STEPS",
      earliestResolutionTurn: 6,
    });

    const waiting = resolveSimulatedAuthorization(
      SimulatedAuthorizationProgressSchema.parse({
        procedure,
        requestedTurn: 4,
        currentTurn: 5,
        completedSteps: procedure.requiredSteps,
      }),
    );
    expect(waiting).toEqual({
      status: "pending",
      reasonCode: "LEAD_TIME",
      missingSteps: [],
      earliestResolutionTurn: 6,
    });

    const authorized = resolveSimulatedAuthorization(
      SimulatedAuthorizationProgressSchema.parse({
        procedure,
        requestedTurn: 4,
        currentTurn: 6,
        completedSteps: procedure.requiredSteps,
      }),
    );
    expect(authorized).toEqual({ status: "authorized", resolvedTurn: 6 });
  });

  it("expires a fictional request and rejects duplicate procedure steps", () => {
    const procedure =
      productionScenarioConfiguration.authorizationProcedures[0]!;
    expect(
      resolveSimulatedAuthorization(
        SimulatedAuthorizationProgressSchema.parse({
          procedure,
          requestedTurn: 4,
          currentTurn: 10,
          completedSteps: procedure.requiredSteps,
        }),
      ),
    ).toEqual({ status: "expired", expiredTurn: 10 });
    expect(() =>
      SimulatedAuthorizationProgressSchema.parse({
        procedure,
        requestedTurn: 4,
        currentTurn: 4,
        completedSteps: ["commission_submission", "commission_submission"],
      }),
    ).toThrow(/must not contain duplicates/u);
  });

  it("scores all six dimensions without producing an overall or leaderboard score", () => {
    const evaluation = evaluateSimulatedCampaign(
      evaluationRequest(Array.from({ length: 20 }, () => 60)),
    );

    expect(Object.keys(evaluation).sort()).toEqual(
      [
        "security",
        "civilianOutcomes",
        "regionalStability",
        "institutionalCohesion",
        "legitimacy",
        "mandateSustainability",
        "causalChains",
      ].sort(),
    );
    expect(evaluation.security).toMatchObject({
      score: 60,
      startingScore: 60,
      endingScore: 60,
      trend: "stable",
      criticalTurns: 0,
    });
    expect(
      EVALUATION_DIMENSIONS.every((key) => evaluation[key].score === 60),
    ).toBe(true);
    expect(evaluation).not.toHaveProperty("overallScore");
  });

  it("penalizes sustained failure, last-turn cosmetics, and countervailing harm", () => {
    const cosmeticRecovery = evaluateSimulatedCampaign(
      evaluationRequest([...Array.from({ length: 19 }, () => 0), 100]),
    );
    expect(cosmeticRecovery.security).toMatchObject({
      score: 18,
      startingScore: 0,
      endingScore: 100,
      trend: "improving",
      criticalTurns: 19,
    });

    const harmed = evaluateSimulatedCampaign(
      evaluationRequest(
        Array.from({ length: 20 }, () => 60),
        100,
      ),
    );
    expect(harmed.security.score).toBe(35);
  });

  it("rejects incomplete trajectories and any attempt to enable a leaderboard", () => {
    expect(() =>
      evaluateSimulatedCampaign(
        evaluationRequest(Array.from({ length: 19 }, () => 50)),
      ),
    ).toThrow(/Expected 20 evaluation snapshots/u);

    const altered = clone(productionScenarioConfiguration) as unknown as {
      competitiveLeaderboard: Record<string, unknown>;
    };
    altered.competitiveLeaderboard = {
      enabled: true,
      reasonCode: "OWNER_DISABLED_NONCOMPETITIVE_RELEASE",
      compositeScore: 100,
    };
    expect(() =>
      ProductionScenarioConfigurationSchema.parse(altered),
    ).toThrow();
  });

  it("publishes explicit, bounded action costs with no free consequential action", () => {
    expect(productionScenarioConfiguration.actionCosts).toHaveLength(3);
    for (const action of productionScenarioConfiguration.actionCosts) {
      expect(action.decisionSlotCost).toBe(1);
      expect(action.costProfile.costs.length).toBeGreaterThan(0);
      expect(
        action.costProfile.costs.every((cost) => (cost.amount ?? 0) > 0),
      ).toBe(true);
    }
  });
});
