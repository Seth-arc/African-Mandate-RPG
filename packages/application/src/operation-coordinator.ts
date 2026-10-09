import { CampaignIdSchema, type CampaignId } from "@african-mandate/domain";

import {
  CAMPAIGN_OPERATION_KINDS,
  type CampaignEditLock,
  type CampaignOperationCoordinator,
  type CampaignOperationKind,
} from "./ports.js";

const operationKinds = new Set<string>(CAMPAIGN_OPERATION_KINDS);

export class InvalidCampaignOperationError extends TypeError {
  public constructor(message: string) {
    super(message);
    this.name = "InvalidCampaignOperationError";
  }
}

export class SerialCampaignOperationCoordinator implements CampaignOperationCoordinator {
  readonly #tails = new Map<CampaignId, Promise<void>>();
  readonly #editLock: CampaignEditLock;

  public constructor(editLock: CampaignEditLock) {
    this.#editLock = editLock;
  }

  public async runExclusive<Result>(
    campaignId: CampaignId,
    kind: CampaignOperationKind,
    operation: () => Promise<Result>,
  ): Promise<Result> {
    const parsedCampaignId = CampaignIdSchema.safeParse(campaignId);
    if (!parsedCampaignId.success) {
      throw new InvalidCampaignOperationError("Invalid campaign ID");
    }
    if (!operationKinds.has(kind)) {
      throw new InvalidCampaignOperationError(
        "Invalid campaign operation kind",
      );
    }
    if (typeof operation !== "function") {
      throw new InvalidCampaignOperationError("Operation must be a function");
    }

    const predecessor =
      this.#tails.get(parsedCampaignId.data) ?? Promise.resolve();
    let releaseQueue!: () => void;
    const queueGate = new Promise<void>((resolve) => {
      releaseQueue = resolve;
    });
    const tail = predecessor.then(() => queueGate);
    this.#tails.set(parsedCampaignId.data, tail);

    await predecessor;
    let lease;
    try {
      lease = await this.#editLock.acquire(parsedCampaignId.data);
      return await operation();
    } finally {
      try {
        if (lease !== undefined) await lease.release();
      } finally {
        releaseQueue();
        if (this.#tails.get(parsedCampaignId.data) === tail) {
          this.#tails.delete(parsedCampaignId.data);
        }
      }
    }
  }
}
