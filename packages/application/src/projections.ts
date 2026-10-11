import {
  ActionMenuEntrySchema,
  AtomicEndTurnResultSchema,
  AtomicStrategicCommandResultSchema,
  CampaignIdSchema,
  IsoDateSchema,
  PlayerKnowledgeProjectionSchema,
  type ActionMenuEntry,
  type AtomicEndTurnResult,
  type AtomicStrategicCommandResult,
  type CampaignId,
  type JsonValue,
} from "@african-mandate/domain";
import { hashCanonicalJson } from "@african-mandate/simulation";
import { z } from "zod";

import type { SimulationPort, SimulationPortTypes } from "./ports.js";

export const PROJECTION_FACADE_SCHEMA_VERSION = 1 as const;

const ProjectionIdentitySchema = z
  .object({
    schemaVersion: z.literal(PROJECTION_FACADE_SCHEMA_VERSION),
    campaignId: CampaignIdSchema,
    campaignRevision: z.number().int().nonnegative(),
  })
  .strict();

/** Test-only proposal: sources name this facade but do not fix exact fields. */
export const CampaignProjectionSchema = ProjectionIdentitySchema.extend({
  projectionType: z.literal("campaign"),
  currentTurn: z.number().int().positive(),
  maxTurns: z.number().int().positive(),
  currentDate: IsoDateSchema,
  decisionsRemaining: z.number().int().nonnegative(),
  decisionsPerTurn: z.number().int().positive(),
  campaignStatus: z.enum(["active", "completed", "terminated", "invalid"]),
  playerKnowledge: PlayerKnowledgeProjectionSchema,
})
  .strict()
  .superRefine((projection, ctx) => {
    if (
      projection.playerKnowledge.campaignRevision !==
      projection.campaignRevision
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["playerKnowledge", "campaignRevision"],
        message: "Knowledge projection revision must match campaign revision",
      });
    }
    if (projection.decisionsRemaining > projection.decisionsPerTurn) {
      ctx.addIssue({
        code: "custom",
        path: ["decisionsRemaining"],
        message: "Remaining decisions cannot exceed decisions per turn",
      });
    }
  });

/** Test-only proposal over the accepted knowledge-safe ActionMenuEntry. */
export const ActionPreviewSchema = ProjectionIdentitySchema.extend({
  projectionType: z.literal("action_preview"),
  action: ActionMenuEntrySchema,
}).strict();

/** Test-only proposal exposing only public atomic-result fields. */
export const ResolutionProjectionSchema = ProjectionIdentitySchema.extend({
  projectionType: z.literal("resolution"),
  operationKind: z.enum(["strategic_command", "end_turn"]),
  commandId: z.string().min(1).optional(),
  status: z.enum(["committed", "duplicate", "rejected"]),
  outcomeCode: z.string().min(1),
  authoritativeStateHash: z
    .string()
    .regex(/^[a-f0-9]{64}$/u)
    .optional(),
}).strict();

export const PlayerProjectionSchema = z.discriminatedUnion("projectionType", [
  CampaignProjectionSchema,
  ActionPreviewSchema,
  ResolutionProjectionSchema,
]);

/** Test-only application call shape; never serialized into campaign state. */
export const CampaignProjectionRequestSchema = z
  .object({
    campaignId: CampaignIdSchema,
    expectedRevision: z.number().int().nonnegative(),
    locale: z.string().min(1),
    presentationOptions: z.record(z.string(), z.json()).default({}),
  })
  .strict();

export type CampaignProjection = z.infer<typeof CampaignProjectionSchema>;
export type ActionPreview = z.infer<typeof ActionPreviewSchema>;
export type ResolutionProjection = z.infer<typeof ResolutionProjectionSchema>;
export type PlayerProjection = z.infer<typeof PlayerProjectionSchema>;
export type CampaignProjectionRequest = z.infer<
  typeof CampaignProjectionRequestSchema
>;

export interface ApplicationProjectionSimulationPortTypes extends SimulationPortTypes {
  readonly command: never;
  readonly commandResult: never;
  readonly turnCommand: never;
  readonly turnResult: never;
  readonly initializationInput: never;
  readonly campaignState: never;
  readonly projectionRequest: CampaignProjectionRequest;
  readonly playerProjection: CampaignProjection;
}

export type ApplicationProjectionSimulationPort = Pick<
  SimulationPort<ApplicationProjectionSimulationPortTypes>,
  "buildProjection"
>;

export class StaleProjectionError extends Error {
  public constructor(expected: number, actual: number) {
    super(
      `Projection revision mismatch: expected ${String(expected)}, received ${String(actual)}`,
    );
    this.name = "StaleProjectionError";
  }
}

interface ProjectionCacheIdentity {
  readonly campaignId: CampaignId;
  readonly campaignRevision: number;
  readonly projectionType: PlayerProjection["projectionType"];
  readonly subjectId?: string;
  readonly locale: string;
  readonly presentationOptions?: Readonly<Record<string, JsonValue>>;
}

const cacheKey = (identity: ProjectionCacheIdentity): string =>
  [
    identity.campaignId,
    String(identity.campaignRevision),
    identity.projectionType,
    identity.subjectId ?? "",
    identity.locale,
    hashCanonicalJson(identity.presentationOptions ?? {}),
  ].join("\0");

export class ProjectionCache {
  readonly #entries = new Map<string, PlayerProjection>();
  readonly #latestRevision = new Map<CampaignId, number>();

  public get(identity: ProjectionCacheIdentity): PlayerProjection | undefined {
    const campaignId = CampaignIdSchema.parse(identity.campaignId);
    if (this.#latestRevision.get(campaignId) !== identity.campaignRevision) {
      return undefined;
    }
    const value = this.#entries.get(cacheKey(identity));
    return value === undefined ? undefined : structuredClone(value);
  }

  public set(
    identity: ProjectionCacheIdentity,
    projectionValue: PlayerProjection,
  ): void {
    const projection = PlayerProjectionSchema.parse(projectionValue);
    if (
      projection.campaignId !== identity.campaignId ||
      projection.campaignRevision !== identity.campaignRevision ||
      projection.projectionType !== identity.projectionType
    ) {
      throw new TypeError("Projection cache identity does not match value");
    }
    this.invalidateForRevision(
      projection.campaignId,
      projection.campaignRevision,
    );
    this.#entries.set(cacheKey(identity), structuredClone(projection));
  }

  public invalidateForRevision(
    campaignIdValue: CampaignId,
    campaignRevision: number,
  ): void {
    const campaignId = CampaignIdSchema.parse(campaignIdValue);
    if (!Number.isSafeInteger(campaignRevision) || campaignRevision < 0) {
      throw new TypeError("campaignRevision must be a non-negative integer");
    }
    const prior = this.#latestRevision.get(campaignId);
    if (prior !== undefined && campaignRevision < prior) {
      throw new StaleProjectionError(prior, campaignRevision);
    }
    if (prior === campaignRevision) return;
    this.#latestRevision.set(campaignId, campaignRevision);
    const prefix = `${campaignId}\0`;
    for (const key of this.#entries.keys()) {
      if (key.startsWith(prefix)) this.#entries.delete(key);
    }
  }
}

export class CampaignProjectionFacade {
  readonly #simulation: ApplicationProjectionSimulationPort;
  readonly #cache: ProjectionCache;

  public constructor(options: {
    readonly simulation: ApplicationProjectionSimulationPort;
    readonly cache?: ProjectionCache;
  }) {
    this.#simulation = options.simulation;
    this.#cache = options.cache ?? new ProjectionCache();
  }

  public async buildCampaignProjection(
    requestValue: CampaignProjectionRequest,
  ): Promise<CampaignProjection> {
    const request = CampaignProjectionRequestSchema.parse(requestValue);
    const identity = {
      campaignId: request.campaignId,
      campaignRevision: request.expectedRevision,
      projectionType: "campaign" as const,
      locale: request.locale,
      presentationOptions: request.presentationOptions,
    };
    const cached = this.#cache.get(identity);
    if (cached !== undefined) return CampaignProjectionSchema.parse(cached);

    const projection = CampaignProjectionSchema.parse(
      await this.#simulation.buildProjection(request),
    );
    if (
      projection.campaignId !== request.campaignId ||
      projection.campaignRevision !== request.expectedRevision
    ) {
      throw new StaleProjectionError(
        request.expectedRevision,
        projection.campaignRevision,
      );
    }
    this.#cache.set(identity, projection);
    return structuredClone(projection);
  }
}

export const createActionPreview = (input: {
  readonly campaignId: CampaignId;
  readonly campaignRevision: number;
  readonly action: ActionMenuEntry;
}): ActionPreview =>
  ActionPreviewSchema.parse({
    schemaVersion: PROJECTION_FACADE_SCHEMA_VERSION,
    projectionType: "action_preview",
    ...input,
  });

const resultProjectionFields = (
  result: AtomicStrategicCommandResult | AtomicEndTurnResult,
) => ({
  status: result.status,
  ...(result.commandId === undefined ? {} : { commandId: result.commandId }),
  ...(result.campaignRevision === undefined
    ? {}
    : { campaignRevision: result.campaignRevision }),
  ...(result.authoritativeStateHash === undefined
    ? {}
    : { authoritativeStateHash: result.authoritativeStateHash }),
  outcomeCode:
    result.status === "rejected"
      ? result.reasonCode
      : result.status === "duplicate"
        ? "IDEMPOTENT_DUPLICATE"
        : "COMMITTED",
});

export const createResolutionProjection = (input: {
  readonly campaignId: CampaignId;
  readonly operationKind: "strategic_command" | "end_turn";
  readonly result: AtomicStrategicCommandResult | AtomicEndTurnResult;
  readonly currentRevision: number;
}): ResolutionProjection => {
  const result =
    input.operationKind === "strategic_command"
      ? AtomicStrategicCommandResultSchema.parse(input.result)
      : AtomicEndTurnResultSchema.parse(input.result);
  return ResolutionProjectionSchema.parse({
    schemaVersion: PROJECTION_FACADE_SCHEMA_VERSION,
    projectionType: "resolution",
    campaignId: input.campaignId,
    campaignRevision: result.campaignRevision ?? input.currentRevision,
    operationKind: input.operationKind,
    ...resultProjectionFields(result),
  });
};
