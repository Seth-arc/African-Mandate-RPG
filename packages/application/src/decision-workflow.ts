import {
  ActionIdSchema,
  AtomicEndTurnResultSchema,
  AtomicStrategicCommandRequestSchema,
  AtomicStrategicCommandResultSchema,
  CampaignIdSchema,
  DecisionIdSchema,
  EndTurnRequestSchema,
  IsoDateSchema,
  type AtomicEndTurnResult,
  type AtomicStrategicCommandRequest,
  type AtomicStrategicCommandResult,
  type EndTurnRequest,
} from "@african-mandate/domain";
import { z } from "zod";

import { StaleProjectionError } from "./projections.js";
import {
  ActionPreviewSchema,
  CampaignProjectionSchema,
} from "./projections.js";

export const DECISION_WORKFLOW_SCHEMA_VERSION = 1 as const;
export const DECISION_WORKFLOW_CONTRACT_VERSION = "0.1.0-test.1" as const;

const JournalEntrySchema = z
  .object({
    entryId: z.string().min(1),
    commandId: z.string().min(1),
    decisionId: DecisionIdSchema,
    campaignRevision: z.number().int().positive(),
    turn: z.number().int().positive(),
    sequenceWithinTurn: z.number().int().positive(),
    actionId: ActionIdSchema,
    actionLabel: z.string().min(1),
    outcomeSummary: z.string().min(1),
    committedOn: IsoDateSchema,
  })
  .strict();

export const DecisionJournalEntrySchema = JournalEntrySchema;

export const ResolutionLedgerCategorySchema = z.enum([
  "implementation",
  "institutions",
  "regional_conditions",
  "intelligence",
  "watch",
]);

export const ResolutionLedgerEntrySchema = z
  .object({
    entryId: z.string().min(1),
    commandId: z.string().min(1),
    campaignRevision: z.number().int().positive(),
    resolvedTurn: z.number().int().positive(),
    sequence: z.number().int().positive(),
    category: ResolutionLedgerCategorySchema,
    summary: z.string().min(1),
  })
  .strict();

export const DecisionActionOptionSchema = z
  .object({
    optionId: z.string().min(1),
    label: z.string().min(1),
    request: AtomicStrategicCommandRequestSchema,
    preview: ActionPreviewSchema,
  })
  .strict()
  .superRefine((option, context) => {
    if (option.request.command.campaignId !== option.preview.campaignId) {
      context.addIssue({
        code: "custom",
        path: ["request", "command", "campaignId"],
        message: "Action request and preview campaign IDs must match",
      });
    }
    if (option.request.expectedRevision !== option.preview.campaignRevision) {
      context.addIssue({
        code: "custom",
        path: ["request", "expectedRevision"],
        message: "Action request and preview revisions must match",
      });
    }
    if (
      option.request.command.payload.actionId !== option.preview.action.actionId
    ) {
      context.addIssue({
        code: "custom",
        path: ["request", "command", "payload", "actionId"],
        message: "Action request and preview action IDs must match",
      });
    }
  });

const EndMonthControlSchema = z
  .object({
    available: z.boolean(),
    reason: z.string().min(1).optional(),
    request: EndTurnRequestSchema,
  })
  .strict()
  .superRefine((control, context) => {
    if (!control.available && control.reason === undefined) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Unavailable End Month controls require a visible reason",
      });
    }
  });

const assertUnique = (
  values: readonly string[],
  path: string,
  context: z.RefinementCtx,
) => {
  if (new Set(values).size !== values.length) {
    context.addIssue({
      code: "custom",
      path: [path],
      message: `${path} must contain unique IDs`,
    });
  }
};

export const DecisionWorkspaceProjectionSchema = z
  .object({
    schemaVersion: z.literal(DECISION_WORKFLOW_SCHEMA_VERSION),
    contractVersion: z.literal(DECISION_WORKFLOW_CONTRACT_VERSION),
    classification: z.enum([
      "TEST_ONLY_DECISION_WORKSPACE",
      "SIMULATED_PRODUCTION_DECISION_WORKSPACE",
    ]),
    campaign: CampaignProjectionSchema,
    actionOptions: z.array(DecisionActionOptionSchema),
    journal: z.array(DecisionJournalEntrySchema),
    resolutionLedger: z.array(ResolutionLedgerEntrySchema),
    endMonth: EndMonthControlSchema,
  })
  .strict()
  .superRefine((workspace, context) => {
    const campaignId = workspace.campaign.campaignId;
    const revision = workspace.campaign.campaignRevision;
    assertUnique(
      workspace.actionOptions.map(({ optionId }) => optionId),
      "actionOptions",
      context,
    );
    assertUnique(
      workspace.journal.map(({ entryId }) => entryId),
      "journal",
      context,
    );
    assertUnique(
      workspace.journal.map(({ commandId }) => commandId),
      "journal.commandId",
      context,
    );
    assertUnique(
      workspace.resolutionLedger.map(({ entryId }) => entryId),
      "resolutionLedger",
      context,
    );

    workspace.actionOptions.forEach((option, index) => {
      if (
        option.preview.campaignId !== campaignId ||
        option.preview.campaignRevision !== revision
      ) {
        context.addIssue({
          code: "custom",
          path: ["actionOptions", index, "preview"],
          message: "Action preview identity must match the campaign projection",
        });
      }
      if (
        option.request.command.submittedTurn !== workspace.campaign.currentTurn
      ) {
        context.addIssue({
          code: "custom",
          path: ["actionOptions", index, "request", "command", "submittedTurn"],
          message: "Action request turn must match the campaign projection",
        });
      }
    });
    if (
      workspace.endMonth.request.command.campaignId !== campaignId ||
      workspace.endMonth.request.expectedRevision !== revision
    ) {
      context.addIssue({
        code: "custom",
        path: ["endMonth", "request"],
        message:
          "End Month request identity must match the campaign projection",
      });
    }
    if (
      workspace.endMonth.request.command.submittedTurn !==
      workspace.campaign.currentTurn
    ) {
      context.addIssue({
        code: "custom",
        path: ["endMonth", "request", "command", "submittedTurn"],
        message: "End Month request turn must match the campaign projection",
      });
    }
    workspace.journal.forEach((entry, index) => {
      if (entry.campaignRevision > revision) {
        context.addIssue({
          code: "custom",
          path: ["journal", index, "campaignRevision"],
          message: "Journal entry cannot be newer than the campaign projection",
        });
      }
    });
    workspace.resolutionLedger.forEach((entry, index) => {
      if (entry.campaignRevision > revision) {
        context.addIssue({
          code: "custom",
          path: ["resolutionLedger", index, "campaignRevision"],
          message: "Ledger entry cannot be newer than the campaign projection",
        });
      }
    });
    for (let index = 1; index < workspace.journal.length; index += 1) {
      const previous = workspace.journal[index - 1]!;
      const current = workspace.journal[index]!;
      if (
        current.campaignRevision <= previous.campaignRevision ||
        current.turn < previous.turn ||
        (current.turn === previous.turn &&
          current.sequenceWithinTurn <= previous.sequenceWithinTurn)
      ) {
        context.addIssue({
          code: "custom",
          path: ["journal", index],
          message: "Decision journal must be append-only chronological history",
        });
      }
    }
    for (let index = 1; index < workspace.resolutionLedger.length; index += 1) {
      const previous = workspace.resolutionLedger[index - 1]!;
      const current = workspace.resolutionLedger[index]!;
      if (
        current.campaignRevision < previous.campaignRevision ||
        (current.campaignRevision === previous.campaignRevision &&
          current.sequence <= previous.sequence)
      ) {
        context.addIssue({
          code: "custom",
          path: ["resolutionLedger", index],
          message:
            "Resolution ledger must be append-only chronological history",
        });
      }
    }
  });

export type DecisionJournalEntry = z.infer<typeof DecisionJournalEntrySchema>;
export type ResolutionLedgerEntry = z.infer<typeof ResolutionLedgerEntrySchema>;
export type DecisionActionOption = z.infer<typeof DecisionActionOptionSchema>;
export type DecisionWorkspaceProjection = z.infer<
  typeof DecisionWorkspaceProjectionSchema
>;

export interface DecisionProjectionLoader {
  load(
    campaignId: z.infer<typeof CampaignIdSchema>,
    expectedRevision: number,
  ): Promise<DecisionWorkspaceProjection>;
}

export interface DecisionCommandPort {
  dispatch(
    request: AtomicStrategicCommandRequest,
  ): Promise<AtomicStrategicCommandResult>;
}

export interface DecisionTurnPort {
  endTurn(request: EndTurnRequest): Promise<AtomicEndTurnResult>;
}

export type DecisionCommitOutcome = Readonly<{
  result: AtomicStrategicCommandResult;
  projection: DecisionWorkspaceProjection;
}>;

export type EndMonthOutcome = Readonly<{
  result: AtomicEndTurnResult;
  projection: DecisionWorkspaceProjection;
}>;

const assertPrefixUnchanged = <T>(
  label: string,
  prior: readonly T[],
  next: readonly T[],
) => {
  if (next.length < prior.length) {
    throw new TypeError(`${label} cannot remove committed history`);
  }
  prior.forEach((entry, index) => {
    if (JSON.stringify(entry) !== JSON.stringify(next[index])) {
      throw new TypeError(
        `${label} cannot reorder or rewrite committed history`,
      );
    }
  });
};

/**
 * Coordinates the already accepted atomic services with player-safe projections.
 * Service completion is the durability boundary; no projection is loaded before it.
 */
export class DecisionWorkflowCoordinator {
  readonly #commands: DecisionCommandPort;
  readonly #turns: DecisionTurnPort;
  readonly #projections: DecisionProjectionLoader;

  public constructor(options: {
    readonly commands: DecisionCommandPort;
    readonly turns: DecisionTurnPort;
    readonly projections: DecisionProjectionLoader;
  }) {
    this.#commands = options.commands;
    this.#turns = options.turns;
    this.#projections = options.projections;
  }

  public async commit(
    priorValue: DecisionWorkspaceProjection,
    requestValue: AtomicStrategicCommandRequest,
  ): Promise<DecisionCommitOutcome> {
    const prior = DecisionWorkspaceProjectionSchema.parse(priorValue);
    const request = AtomicStrategicCommandRequestSchema.parse(requestValue);
    if (request.expectedRevision !== prior.campaign.campaignRevision) {
      throw new StaleProjectionError(
        prior.campaign.campaignRevision,
        request.expectedRevision,
      );
    }
    const result = AtomicStrategicCommandResultSchema.parse(
      await this.#commands.dispatch(request),
    );
    if (result.status === "rejected") return { result, projection: prior };

    const next = DecisionWorkspaceProjectionSchema.parse(
      await this.#projections.load(
        prior.campaign.campaignId,
        result.campaignRevision,
      ),
    );
    if (next.campaign.campaignId !== prior.campaign.campaignId) {
      throw new TypeError("Refreshed campaign identity cannot change");
    }
    if (next.campaign.campaignRevision !== result.campaignRevision) {
      throw new StaleProjectionError(
        result.campaignRevision,
        next.campaign.campaignRevision,
      );
    }
    assertPrefixUnchanged("Decision journal", prior.journal, next.journal);
    assertPrefixUnchanged(
      "Resolution ledger",
      prior.resolutionLedger,
      next.resolutionLedger,
    );
    if (
      result.status === "committed" &&
      !next.journal.some(({ commandId }) => commandId === result.commandId)
    ) {
      throw new TypeError(
        "A durable committed decision must be visible in the refreshed journal",
      );
    }
    return { result, projection: next };
  }

  public async endMonth(
    priorValue: DecisionWorkspaceProjection,
    requestValue: EndTurnRequest,
  ): Promise<EndMonthOutcome> {
    const prior = DecisionWorkspaceProjectionSchema.parse(priorValue);
    const request = EndTurnRequestSchema.parse(requestValue);
    if (request.expectedRevision !== prior.campaign.campaignRevision) {
      throw new StaleProjectionError(
        prior.campaign.campaignRevision,
        request.expectedRevision,
      );
    }
    const result = AtomicEndTurnResultSchema.parse(
      await this.#turns.endTurn(request),
    );
    if (result.status === "rejected") return { result, projection: prior };

    const next = DecisionWorkspaceProjectionSchema.parse(
      await this.#projections.load(
        prior.campaign.campaignId,
        result.campaignRevision,
      ),
    );
    if (next.campaign.campaignId !== prior.campaign.campaignId) {
      throw new TypeError("Refreshed campaign identity cannot change");
    }
    if (next.campaign.campaignRevision !== result.campaignRevision) {
      throw new StaleProjectionError(
        result.campaignRevision,
        next.campaign.campaignRevision,
      );
    }
    assertPrefixUnchanged("Decision journal", prior.journal, next.journal);
    assertPrefixUnchanged(
      "Resolution ledger",
      prior.resolutionLedger,
      next.resolutionLedger,
    );
    if (
      result.status === "committed" &&
      next.resolutionLedger.length === prior.resolutionLedger.length
    ) {
      throw new TypeError(
        "A durable End Month result must be visible in the refreshed ledger",
      );
    }
    return { result, projection: next };
  }
}
