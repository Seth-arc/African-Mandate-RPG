import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  MapArtifactManifestSchema,
  ReleaseManifestSchema,
  createSaveSnapshot,
} from "@african-mandate/application";
import {
  CampaignArtifactRefsSchema,
  CampaignStateSchema,
  ScenarioBundleSchema,
  createInitialDoctrineState,
  createUnavailableEvaluationState,
} from "@african-mandate/domain";
import { assertProductionClassification } from "@african-mandate/data-pipeline";

const root = resolve(import.meta.dirname, "../..");
const production = resolve(root, "apps/web/public/production");
const json = async (name: string): Promise<unknown> =>
  JSON.parse(await readFile(resolve(production, name), "utf8")) as unknown;
const sha256 = (value: Uint8Array | string): string =>
  createHash("sha256").update(value).digest("hex");

describe("production artifact boundary", () => {
  it("publishes pinned production-only release, scenario, methodology, and direct map contracts", async () => {
    const release = ReleaseManifestSchema.parse(
      await json("release.manifest.json"),
    );
    const scenario = ScenarioBundleSchema.parse(
      await json("scenario.bundle.json"),
    );
    const map = MapArtifactManifestSchema.parse(
      await json("map.manifest.json"),
    );
    const hashes = (await json("artifact-hashes.json")) as {
      artifacts: Record<string, string>;
    };
    [release, scenario, map].forEach(assertProductionClassification);
    const entry = release.scenarios[scenario.scenario.scenarioId]!;
    expect(entry.defaultForNewCampaigns).toBe(true);
    expect(entry.methodology.hash).toBe(
      hashes.artifacts["methodology.manifest.json"],
    );
    expect(map).toMatchObject({
      format: "african_map_json_bundle",
      artifactHash:
        hashes.artifacts[
          "african_map.8ef3de3e1bcb846c405915fad33c03f1b38376d83e66ba6d8900681202da3c27.json"
        ],
    });
    expect(scenario.balance.implementation).toMatchObject({
      "initial.player.politicalCapital": 30,
      "initial.player.secretariatCapacity": 30,
      "cost.action_simulated_collect_evidence.secretariat_capacity": 6,
      "cost.action_simulated_request_authorization.political_capital": 12,
    });
  });

  it("rejects TEST_ONLY classification text from the production serializer", () => {
    expect(() =>
      assertProductionClassification({ classification: "TEST_ONLY_FIXTURE" }),
    ).toThrow(/must not contain TEST_ONLY/u);
  });

  it("writes Save Snapshot v2 with immutable artifact identity", () => {
    const state = CampaignStateSchema.parse({
      meta: {
        campaignId: "campaign_production_snapshot_test",
        scenarioId: "scenario_production_snapshot_test",
        campaignSeed: "production-snapshot-seed",
        difficultyProfileId: "difficulty_production_snapshot",
        currentTurn: 1,
        maxTurns: 20,
        currentDate: "2025-10-01",
        decisionsRemaining: 3,
        decisionsPerTurn: 3,
        revision: 0,
        status: "active",
      },
      player: {
        representedInstitutionId: "institution_au_commission",
        materialResources: {
          budget: { amount: 0, currency: "USD" },
          personnel: 0,
          logistics: 0,
        },
        institutionalCapacity: {
          mandateAuthority: 25,
          politicalCapital: 30,
          secretariatCapacity: 30,
          memberStateAlignment: 40,
          partnerConfidence: 40,
          implementationCapacity: 25,
          intelligenceConfidence: 25,
        },
      },
      world: {
        territories: {},
        zones: {},
        conflict: { zones: {} },
        civilian: { zones: {} },
        infrastructure: { assets: {}, corridors: {} },
        development: { zones: {} },
        externalEnvironment: {
          externalPowerCompetition: 50,
          donorRiskTolerance: 50,
          commodityPressure: 50,
          regionalDiplomaticPressure: 50,
        },
      },
      institutions: {},
      actors: {},
      relationships: {},
      positions: {},
      memories: {},
      commitments: {},
      redLines: {},
      disputes: {},
      knowledge: {
        evidence: {},
        reports: {},
        intelligenceGaps: {},
        collectionTasks: {},
        redLineKnowledge: {},
        positionKnowledge: {},
        knownCommitmentIds: [],
        knownDisputeIds: [],
        relationshipKnowledge: {},
      },
      assessments: {},
      mandateCases: {},
      implementations: {},
      worldEvents: {},
      situations: {},
      attention: { items: {} },
      scheduledConsequences: {},
      doctrine: createInitialDoctrineState(),
      evaluation: createUnavailableEvaluationState(),
      decisions: [],
      domainEvents: [],
      processedCommandIds: {},
      versions: {
        gameSchemaVersion: 1,
        simulationModelVersion: "1.0.0-production-proposal.1",
        baselineVersion: "1.0.0-production-proposal.1",
        scenarioVersion: "1.0.0-simulated.1",
        contentVersion: "1.0.0-opening-proposal.1",
        balanceProfileVersion: "1.0.0-simulated.1",
        methodologyVersion: "1.0.0-production-proposal.1",
      },
    });
    const refs = CampaignArtifactRefsSchema.parse({
      scenarioId: state.meta.scenarioId,
      scenarioBundleSchemaVersion: 1,
      scenarioBundleHash: sha256("scenario"),
      baselineSchemaVersion: 1,
      baselineHash: sha256("baseline"),
      mapArtifactSchemaVersion: 1,
      mapArtifactHash: sha256("map"),
    });
    expect(createSaveSnapshot(state, refs)).toMatchObject({
      snapshotVersion: 2,
      artifacts: refs,
    });
  });
});
