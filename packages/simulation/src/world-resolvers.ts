import {
  CampaignStateSchema,
  ScoreSchema,
  SignedScoreSchema,
  WORLD_RESOLVER_CONTRACT_VERSION,
  WorldResolutionRequestSchema,
  WorldResolutionResultSchema,
  WorldSubsystemCoverageSchema,
  type CampaignState,
  type WorldEffect,
  type WorldEffectEnvelope,
  type WorldResolutionRejectionReason,
  type WorldResolutionResult,
  type WorldResolutionTrace,
  type WorldSubsystemCoverage,
  type WorldSubsystemId,
} from "@african-mandate/domain";

import { hashCanonicalJson } from "./determinism/canonical-json.js";
import {
  deriveSimulationId,
  roundHalfAwayFromZero,
} from "./determinism/primitives.js";

const coverage = (
  subsystem: WorldSubsystemId,
  ownerPath: string,
  mode: WorldSubsystemCoverage["mode"],
  blocker: string,
): WorldSubsystemCoverage =>
  WorldSubsystemCoverageSchema.parse({
    contractVersion: WORLD_RESOLVER_CONTRACT_VERSION,
    subsystem,
    ownerPath,
    mode,
    productionDynamics: "BLOCKED",
    blocker,
  });

export const WORLD_SUBSYSTEM_COVERAGE = Object.freeze([
  coverage(
    "institution_resources",
    "CampaignState.institutions[*].resources",
    "canonical_typed_effects",
    "Production resource values and dynamics are not approved.",
  ),
  coverage(
    "territory_core",
    "CampaignState.world.territories",
    "canonical_typed_effects",
    "Production territory dynamics are not approved.",
  ),
  coverage(
    "zone_core",
    "CampaignState.world.zones",
    "canonical_typed_effects",
    "Production zone dynamics are not approved.",
  ),
  coverage(
    "conflict",
    "CampaignState.world.conflict",
    "canonical_typed_effects",
    "Conflict coefficients, maxima, adjacency behavior, and shocks are not approved.",
  ),
  coverage(
    "civilian",
    "CampaignState.world.civilian",
    "canonical_typed_effects",
    "Production civilian formulas are not approved.",
  ),
  coverage(
    "infrastructure",
    "CampaignState.world.infrastructure",
    "canonical_typed_effects",
    "Production infrastructure formulas are not approved.",
  ),
  coverage(
    "development",
    "CampaignState.world.development",
    "canonical_typed_effects",
    "Production development formulas are not approved.",
  ),
  coverage(
    "external_environment",
    "CampaignState.world.externalEnvironment",
    "initial_no_op",
    "No canonical external-environment effect contract or update formula is approved.",
  ),
] as const);

const expectedSubsystem = (effect: WorldEffect): WorldSubsystemId => {
  switch (effect.kind) {
    case "adjust_institution_resource":
      return "institution_resources";
    case "adjust_territory_core":
      return "territory_core";
    case "adjust_zone_core":
      return "zone_core";
    case "adjust_conflict":
      return "conflict";
    case "adjust_civilian":
      return "civilian";
    case "adjust_infrastructure":
    case "set_asset_status":
      return "infrastructure";
    case "adjust_development":
      return "development";
  }
};

const adjustedScore = (current: number, delta: number) =>
  ScoreSchema.parse(
    Math.min(100, Math.max(0, roundHalfAwayFromZero(current + delta))),
  );

const adjustedSignedScore = (current: number, delta: number) =>
  SignedScoreSchema.parse(
    Math.min(100, Math.max(-100, roundHalfAwayFromZero(current + delta))),
  );

const applyOptionalScore = (
  current: number,
  value: number | undefined,
): number | undefined =>
  value === undefined ? undefined : adjustedScore(current, value);

class WorldEffectApplicationError extends Error {
  public constructor(
    public readonly reasonCode: WorldResolutionRejectionReason,
    public readonly detailCode: string,
  ) {
    super(detailCode);
    this.name = "WorldEffectApplicationError";
  }
}

const targetNotFound = (detailCode: string): never => {
  throw new WorldEffectApplicationError("TARGET_NOT_FOUND", detailCode);
};

const applyEffect = (
  draft: CampaignState,
  effect: WorldEffect,
): readonly string[] => {
  const changed: string[] = [];
  const set = <T>(
    path: string,
    current: T,
    next: T | undefined,
    assign: (value: T) => void,
  ): void => {
    if (next !== undefined && next !== current) {
      assign(next);
      changed.push(path);
    }
  };

  switch (effect.kind) {
    case "adjust_institution_resource": {
      const institution = draft.institutions[effect.institutionId];
      if (institution === undefined) {
        return targetNotFound(`INSTITUTION:${effect.institutionId}`);
      }
      const next = adjustedScore(
        institution.resources[effect.resource],
        effect.delta,
      );
      set(
        `institutions.${effect.institutionId}.resources.${effect.resource}`,
        institution.resources[effect.resource],
        next,
        (value) => {
          institution.resources[effect.resource] = value;
        },
      );
      break;
    }
    case "adjust_territory_core": {
      const territory = draft.world.territories[effect.territoryId];
      if (territory === undefined) {
        return targetNotFound(`TERRITORY:${effect.territoryId}`);
      }
      set(
        `world.territories.${effect.territoryId}.stability`,
        territory.stability,
        applyOptionalScore(territory.stability, effect.stabilityDelta),
        (value) => {
          territory.stability = ScoreSchema.parse(value);
        },
      );
      set(
        `world.territories.${effect.territoryId}.institutionalCapacity`,
        territory.institutionalCapacity,
        applyOptionalScore(
          territory.institutionalCapacity,
          effect.institutionalCapacityDelta,
        ),
        (value) => {
          territory.institutionalCapacity = ScoreSchema.parse(value);
        },
      );
      set(
        `world.territories.${effect.territoryId}.economicResilience`,
        territory.economicResilience,
        applyOptionalScore(
          territory.economicResilience,
          effect.economicResilienceDelta,
        ),
        (value) => {
          territory.economicResilience = ScoreSchema.parse(value);
        },
      );
      break;
    }
    case "adjust_zone_core": {
      const zone = draft.world.zones[effect.zoneId];
      if (zone === undefined) return targetNotFound(`ZONE:${effect.zoneId}`);
      const fields = [
        ["statePresence", effect.statePresenceDelta],
        ["controlContest", effect.controlContestDelta],
        ["localGovernanceCapacity", effect.localGovernanceCapacityDelta],
      ] as const;
      for (const [field, fieldDelta] of fields) {
        set(
          `world.zones.${effect.zoneId}.${field}`,
          zone[field],
          applyOptionalScore(zone[field], fieldDelta),
          (value) => {
            zone[field] = ScoreSchema.parse(value);
          },
        );
      }
      break;
    }
    case "adjust_conflict": {
      const zone = draft.world.conflict.zones[effect.zoneId];
      if (zone === undefined) {
        return targetNotFound(`CONFLICT_ZONE:${effect.zoneId}`);
      }
      const scoreFields = [
        ["armedActivity", effect.armedActivityDelta],
        ["civilianTargeting", effect.civilianTargetingDelta],
        ["actorFragmentation", effect.actorFragmentationDelta],
        ["mobility", effect.mobilityDelta],
        ["recruitmentPressure", effect.recruitmentPressureDelta],
        ["spilloverPressure", effect.spilloverPressureDelta],
      ] as const;
      for (const [field, fieldDelta] of scoreFields) {
        set(
          `world.conflict.zones.${effect.zoneId}.${field}`,
          zone[field],
          applyOptionalScore(zone[field], fieldDelta),
          (value) => {
            zone[field] = ScoreSchema.parse(value);
          },
        );
      }
      if (effect.escalationMomentumDelta !== undefined) {
        set(
          `world.conflict.zones.${effect.zoneId}.escalationMomentum`,
          zone.escalationMomentum,
          adjustedSignedScore(
            zone.escalationMomentum,
            effect.escalationMomentumDelta,
          ),
          (value) => {
            zone.escalationMomentum = SignedScoreSchema.parse(value);
          },
        );
      }
      break;
    }
    case "adjust_civilian": {
      const zone = draft.world.civilian.zones[effect.zoneId];
      if (zone === undefined) {
        return targetNotFound(`CIVILIAN_ZONE:${effect.zoneId}`);
      }
      const fields = [
        ["civilianConfidence", effect.civilianConfidenceDelta],
        ["displacementPressure", effect.displacementPressureDelta],
        ["humanitarianAccess", effect.humanitarianAccessDelta],
        ["serviceReliability", effect.serviceReliabilityDelta],
        ["perceivedLegitimacy", effect.perceivedLegitimacyDelta],
      ] as const;
      for (const [field, fieldDelta] of fields) {
        set(
          `world.civilian.zones.${effect.zoneId}.${field}`,
          zone[field],
          applyOptionalScore(zone[field], fieldDelta),
          (value) => {
            zone[field] = ScoreSchema.parse(value);
          },
        );
      }
      break;
    }
    case "adjust_infrastructure": {
      if (effect.assetId !== undefined) {
        const asset = draft.world.infrastructure.assets[effect.assetId];
        if (asset === undefined) {
          return targetNotFound(`ASSET:${effect.assetId}`);
        }
        const fields = [
          ["disruptionRisk", effect.disruptionRiskDelta],
          ["conflictExposure", effect.conflictExposureDelta],
          ["economicDependency", effect.economicDependencyDelta],
        ] as const;
        for (const [field, fieldDelta] of fields) {
          set(
            `world.infrastructure.assets.${effect.assetId}.${field}`,
            asset[field],
            applyOptionalScore(asset[field], fieldDelta),
            (value) => {
              asset[field] = ScoreSchema.parse(value);
            },
          );
        }
      } else if (effect.corridorId !== undefined) {
        const corridor =
          draft.world.infrastructure.corridors[effect.corridorId];
        if (corridor === undefined) {
          return targetNotFound(`CORRIDOR:${effect.corridorId}`);
        }
        const fields = [
          ["disruptionRisk", effect.disruptionRiskDelta],
          ["throughput", effect.throughputDelta],
          ["resilience", effect.resilienceDelta],
        ] as const;
        for (const [field, fieldDelta] of fields) {
          set(
            `world.infrastructure.corridors.${effect.corridorId}.${field}`,
            corridor[field],
            applyOptionalScore(corridor[field], fieldDelta),
            (value) => {
              corridor[field] = ScoreSchema.parse(value);
            },
          );
        }
      }
      break;
    }
    case "set_asset_status": {
      const asset = draft.world.infrastructure.assets[effect.assetId];
      if (asset === undefined) return targetNotFound(`ASSET:${effect.assetId}`);
      set(
        `world.infrastructure.assets.${effect.assetId}.operationalStatus`,
        asset.operationalStatus,
        effect.status,
        (value) => {
          asset.operationalStatus = value;
        },
      );
      break;
    }
    case "adjust_development": {
      const zone = draft.world.development.zones[effect.zoneId];
      if (zone === undefined) {
        return targetNotFound(`DEVELOPMENT_ZONE:${effect.zoneId}`);
      }
      const fields = [
        ["investmentPipeline", effect.investmentPipelineDelta],
        ["implementationAbsorption", effect.implementationAbsorptionDelta],
        ["infrastructureNeed", effect.infrastructureNeedDelta],
        ["serviceDeficit", effect.serviceDeficitDelta],
        ["externalFinanceDependence", effect.externalFinanceDependenceDelta],
      ] as const;
      for (const [field, fieldDelta] of fields) {
        set(
          `world.development.zones.${effect.zoneId}.${field}`,
          zone[field],
          applyOptionalScore(zone[field], fieldDelta),
          (value) => {
            zone[field] = ScoreSchema.parse(value);
          },
        );
      }
      break;
    }
  }
  return changed;
};

const validateSource = (
  state: CampaignState,
  envelope: WorldEffectEnvelope,
): void => {
  const source = envelope.source;
  if (source.kind === "scheduled_consequence") {
    const consequence = state.scheduledConsequences[source.consequenceId];
    if (consequence === undefined) {
      throw new WorldEffectApplicationError(
        "SOURCE_NOT_FOUND",
        `CONSEQUENCE:${source.consequenceId}`,
      );
    }
    if (consequence.status !== "eligible") {
      throw new WorldEffectApplicationError(
        "SOURCE_NOT_ELIGIBLE",
        `CONSEQUENCE:${source.consequenceId}:${consequence.status}`,
      );
    }
  } else if (
    source.kind === "world_event" &&
    state.worldEvents[source.worldEventId] === undefined
  ) {
    throw new WorldEffectApplicationError(
      "SOURCE_NOT_FOUND",
      `WORLD_EVENT:${source.worldEventId}`,
    );
  }
};

const rejection = (
  reasonCode: WorldResolutionRejectionReason,
  detailCode?: string,
): WorldResolutionResult =>
  WorldResolutionResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const resolveWorldEffects = (
  inputValue: unknown,
): WorldResolutionResult => {
  const input = WorldResolutionRequestSchema.safeParse(inputValue);
  if (!input.success) return rejection("INVALID_REQUEST_SCHEMA");
  const request = input.data;
  if (request.turn !== request.currentState.meta.currentTurn) {
    return rejection("TURN_MISMATCH");
  }

  const baselineHash = hashCanonicalJson(request.baseline);
  const draft = structuredClone(request.currentState);
  const traces: WorldResolutionTrace[] = [];
  try {
    request.effects.forEach((envelope, index) => {
      const owner = expectedSubsystem(envelope.effect);
      if (owner !== envelope.declaredSubsystem) {
        throw new WorldEffectApplicationError(
          "CROSS_SYSTEM_EFFECT",
          `${envelope.effect.kind}:${envelope.declaredSubsystem}:${owner}`,
        );
      }
      validateSource(request.currentState, envelope);
      const changedFields = applyEffect(draft, envelope.effect);
      traces.push({
        traceId: deriveSimulationId({
          entityType: "world_trace",
          campaignSeed: request.currentState.meta.campaignSeed,
          resolutionKey: `${request.turn}:${envelope.effect.effectId}:${hashCanonicalJson(envelope.source)}`,
          ordinal: index,
        }),
        turn: request.turn,
        subsystem: owner,
        effectId: envelope.effect.effectId,
        source: envelope.source,
        outcome: changedFields.length === 0 ? "no_change" : "applied",
        changedFields: [...changedFields],
      });
    });
  } catch (error) {
    if (error instanceof WorldEffectApplicationError) {
      return rejection(error.reasonCode, error.detailCode);
    }
    return rejection("INVALID_RESULT");
  }

  if (hashCanonicalJson(request.baseline) !== baselineHash) {
    return rejection("BASELINE_MUTATED");
  }
  const nextState = CampaignStateSchema.safeParse(draft);
  if (!nextState.success) return rejection("INVALID_RESULT");
  return WorldResolutionResultSchema.parse({
    status: "resolved",
    nextState: nextState.data,
    traces,
  });
};
