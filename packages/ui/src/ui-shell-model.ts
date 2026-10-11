import {
  CampaignProjectionSchema,
  CloudSyncStatusSchema,
  type CampaignProjection,
} from "@african-mandate/application";
import { z } from "zod";

export const UI_SHELL_SCHEMA_VERSION = 1 as const;
export const UI_SHELL_CONTRACT_VERSION = "0.1.0-test.1" as const;

/**
 * TEST_ONLY proposal. Canonical sources require an attention queue but do not
 * define the knowledge-safe projection fields used to render one.
 */
export const UiAttentionItemSchema = z
  .object({
    id: z.string().min(1),
    severity: z.enum(["info", "warning", "critical"]),
    title: z.string().min(1),
    destinationId: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]*$/u),
  })
  .strict();

/**
 * TEST_ONLY proposal. This presentation record does not own persistence; it
 * reports application adapter state only.
 */
export const UiSaveStateSchema = z
  .object({
    localStatus: z.enum(["saved", "saving", "failed", "offline"]),
    syncStatus: CloudSyncStatusSchema,
    detail: z.string().min(1),
  })
  .strict();

/** Projection-derived shell data. It is not campaign state or a second engine. */
export const UiShellModelSchema = z
  .object({
    schemaVersion: z.literal(UI_SHELL_SCHEMA_VERSION),
    contractVersion: z.literal(UI_SHELL_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_UI_SHELL"),
    campaignRevision: z.number().int().nonnegative(),
    currentTurn: z.number().int().positive(),
    maxTurns: z.number().int().positive(),
    currentDate: z.string().date(),
    decisionsRemaining: z.number().int().nonnegative(),
    decisionsPerTurn: z.number().int().positive(),
    campaignStatus: CampaignProjectionSchema.shape.campaignStatus,
    saveState: UiSaveStateSchema,
    attentionItems: z.array(UiAttentionItemSchema),
  })
  .strict()
  .superRefine((model, context) => {
    if (model.currentTurn > model.maxTurns) {
      context.addIssue({
        code: "custom",
        path: ["currentTurn"],
        message: "Current turn cannot exceed maximum turns",
      });
    }
    if (model.decisionsRemaining > model.decisionsPerTurn) {
      context.addIssue({
        code: "custom",
        path: ["decisionsRemaining"],
        message: "Remaining decisions cannot exceed decisions per turn",
      });
    }
    const ids = new Set<string>();
    for (const item of model.attentionItems) {
      if (ids.has(item.id)) {
        context.addIssue({
          code: "custom",
          path: ["attentionItems"],
          message: `Duplicate attention item id: ${item.id}`,
        });
      }
      ids.add(item.id);
    }
  });

export type UiAttentionItem = z.infer<typeof UiAttentionItemSchema>;
export type UiSaveState = z.infer<typeof UiSaveStateSchema>;
export type UiShellModel = z.infer<typeof UiShellModelSchema>;

export const createUiShellModel = (input: {
  readonly projection: CampaignProjection;
  readonly saveState: UiSaveState;
  readonly attentionItems: readonly UiAttentionItem[];
}): UiShellModel => {
  const projection = CampaignProjectionSchema.parse(input.projection);
  return UiShellModelSchema.parse({
    schemaVersion: UI_SHELL_SCHEMA_VERSION,
    contractVersion: UI_SHELL_CONTRACT_VERSION,
    classification: "TEST_ONLY_UI_SHELL",
    campaignRevision: projection.campaignRevision,
    currentTurn: projection.currentTurn,
    maxTurns: projection.maxTurns,
    currentDate: projection.currentDate,
    decisionsRemaining: projection.decisionsRemaining,
    decisionsPerTurn: projection.decisionsPerTurn,
    campaignStatus: projection.campaignStatus,
    saveState: input.saveState,
    attentionItems: input.attentionItems,
  });
};
