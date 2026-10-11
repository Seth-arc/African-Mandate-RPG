import { z } from "zod";
import { CampaignIdSchema, type CampaignId } from "@african-mandate/domain";

import { APPLICATION_ADAPTER_CONTRACT_VERSION } from "./artifact-registry.js";
import { StaleCampaignRevisionError } from "./browser-persistence.js";

export const CloudSyncStatusSchema = z.enum([
  "synced",
  "syncing",
  "unsynced",
  "conflict",
  "unavailable",
]);

/**
 * Test-only proposal: Technical v2 fixes the status vocabulary but does not
 * prescribe the persisted status-record envelope.
 */
export const CampaignSyncStateSchema = z
  .object({
    contractVersion: z.literal(APPLICATION_ADAPTER_CONTRACT_VERSION),
    campaignId: CampaignIdSchema,
    localRevision: z.number().int().nonnegative(),
    remoteRevision: z.number().int().nonnegative().optional(),
    status: CloudSyncStatusSchema,
    reasonCode: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((state, context) => {
    if (
      state.status === "synced" &&
      state.remoteRevision !== state.localRevision
    ) {
      context.addIssue({
        code: "custom",
        message: "synced state requires equal local and remote revisions",
        path: ["remoteRevision"],
      });
    }
  });

export type CloudSyncStatus = z.infer<typeof CloudSyncStatusSchema>;
export type CampaignSyncState = z.infer<typeof CampaignSyncStateSchema>;

const freezeState = (
  input: z.input<typeof CampaignSyncStateSchema>,
): CampaignSyncState => Object.freeze(CampaignSyncStateSchema.parse(input));

/** Sync metadata never owns or replaces the locally durable campaign head. */
export class CampaignSyncStatusStore {
  readonly #states = new Map<string, CampaignSyncState>();

  public initialize(
    campaignId: CampaignId,
    localRevision: number,
    remoteRevision?: number,
  ): CampaignSyncState {
    return this.#put({
      contractVersion: APPLICATION_ADAPTER_CONTRACT_VERSION,
      campaignId,
      localRevision,
      ...(remoteRevision === undefined ? {} : { remoteRevision }),
      status: remoteRevision === localRevision ? "synced" : "unsynced",
    });
  }

  public get(campaignId: CampaignId): CampaignSyncState | undefined {
    return this.#states.get(campaignId);
  }

  public noteLocalCommit(
    campaignId: CampaignId,
    localRevision: number,
  ): CampaignSyncState {
    const prior = this.#require(campaignId);
    if (localRevision <= prior.localRevision) {
      throw new StaleCampaignRevisionError(
        campaignId,
        prior.localRevision,
        localRevision,
      );
    }
    return this.#put({
      ...prior,
      localRevision,
      status: "unsynced",
      reasonCode: "local_revision_pending_upload",
    });
  }

  public markSyncing(campaignId: CampaignId): CampaignSyncState {
    const prior = this.#require(campaignId);
    return this.#put({ ...prior, status: "syncing", reasonCode: undefined });
  }

  /** Returns false when an upload completes against an obsolete local head. */
  public markSynced(
    campaignId: CampaignId,
    attemptedLocalRevision: number,
    remoteRevision: number,
  ): boolean {
    const prior = this.#require(campaignId);
    if (prior.localRevision !== attemptedLocalRevision) return false;
    this.#put({
      ...prior,
      remoteRevision,
      status: "synced",
      reasonCode: undefined,
    });
    return true;
  }

  public markConflict(
    campaignId: CampaignId,
    remoteRevision: number,
    reasonCode = "revision_conflict",
  ): CampaignSyncState {
    const prior = this.#require(campaignId);
    return this.#put({
      ...prior,
      remoteRevision,
      status: "conflict",
      reasonCode,
    });
  }

  public markUnavailable(
    campaignId: CampaignId,
    reasonCode: string,
  ): CampaignSyncState {
    const prior = this.#require(campaignId);
    return this.#put({ ...prior, status: "unavailable", reasonCode });
  }

  #require(campaignId: CampaignId): CampaignSyncState {
    const state = this.#states.get(campaignId);
    if (state === undefined) {
      throw new Error(
        `Sync status is not initialized for campaign ${campaignId}`,
      );
    }
    return state;
  }

  #put(input: z.input<typeof CampaignSyncStateSchema>): CampaignSyncState {
    const state = freezeState(input);
    this.#states.set(state.campaignId, state);
    return state;
  }
}
