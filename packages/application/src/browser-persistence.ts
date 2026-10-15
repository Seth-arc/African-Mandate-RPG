import {
  CampaignIdSchema,
  SaveSnapshotSchema,
  type CampaignId,
  type SaveSnapshot,
} from "@african-mandate/domain";

import {
  CampaignPersistenceError,
  saveSnapshotHashIsValid,
  type AtomicCommandRepositoryTypes,
} from "./atomic-command-service.js";
import type {
  CampaignEditLease,
  CampaignEditLock,
  CampaignRepository,
} from "./ports.js";

export const LOCAL_STORAGE_SCHEMA_VERSION = 1 as const;
export const CAMPAIGN_DATABASE_STORES = [
  "campaign_current",
  "campaign_recovery",
  "campaign_summaries",
  "narrative_cache",
  "storage_metadata",
] as const;

type CampaignStoreName = (typeof CAMPAIGN_DATABASE_STORES)[number];

export class BrowserPersistenceUnavailableError extends Error {
  public constructor(feature: "indexed_db" | "web_locks") {
    super(`Required browser persistence feature unavailable: ${feature}`);
    this.name = "BrowserPersistenceUnavailableError";
  }
}

export class StaleCampaignRevisionError extends Error {
  public constructor(
    campaignId: CampaignId,
    current: number,
    attempted: number,
  ) {
    super(
      `Stale campaign revision for ${campaignId}: current ${String(current)}, attempted ${String(attempted)}`,
    );
    this.name = "StaleCampaignRevisionError";
  }
}

export class CorruptCampaignSnapshotError extends Error {
  public constructor(campaignId: CampaignId) {
    super(`Campaign snapshot failed schema or hash validation: ${campaignId}`);
    this.name = "CorruptCampaignSnapshotError";
  }
}

/** Injectable storage seam; its exact TypeScript shape is a test-only proposal. */
export interface BrowserCampaignStorage {
  loadCurrent(campaignId: CampaignId): Promise<unknown | undefined>;
  loadRecovery(campaignId: CampaignId): Promise<unknown | undefined>;
  commitCurrent(snapshot: SaveSnapshot): Promise<void>;
  restoreCurrent(snapshot: SaveSnapshot): Promise<void>;
  close(): void;
}

const requestValue = <Value>(request: IDBRequest<Value>): Promise<Value> =>
  new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), {
      once: true,
    });
    request.addEventListener(
      "error",
      () => reject(request.error ?? new Error("IndexedDB request failed")),
      { once: true },
    );
  });

const transactionComplete = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve(), { once: true });
    transaction.addEventListener(
      "abort",
      () =>
        reject(transaction.error ?? new Error("IndexedDB transaction aborted")),
      { once: true },
    );
    transaction.addEventListener(
      "error",
      () =>
        reject(transaction.error ?? new Error("IndexedDB transaction failed")),
      { once: true },
    );
  });

const openDatabase = (
  factory: IDBFactory,
  databaseName: string,
): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = factory.open(databaseName, LOCAL_STORAGE_SCHEMA_VERSION);
    request.addEventListener(
      "upgradeneeded",
      () => {
        for (const storeName of CAMPAIGN_DATABASE_STORES) {
          if (!request.result.objectStoreNames.contains(storeName)) {
            request.result.createObjectStore(storeName);
          }
        }
      },
      { once: true },
    );
    request.addEventListener("success", () => resolve(request.result), {
      once: true,
    });
    request.addEventListener(
      "error",
      () => reject(request.error ?? new Error("IndexedDB open failed")),
      { once: true },
    );
    request.addEventListener(
      "blocked",
      () => reject(new Error("IndexedDB upgrade blocked")),
      { once: true },
    );
  });

export class IndexedDbCampaignStorage implements BrowserCampaignStorage {
  readonly #database: IDBDatabase;

  private constructor(database: IDBDatabase) {
    this.#database = database;
  }

  public static async open(options: {
    readonly databaseName: string;
    readonly factory?: IDBFactory;
  }): Promise<IndexedDbCampaignStorage> {
    const factory = options.factory ?? globalThis.indexedDB;
    if (factory === undefined) {
      throw new BrowserPersistenceUnavailableError("indexed_db");
    }
    return new IndexedDbCampaignStorage(
      await openDatabase(factory, options.databaseName),
    );
  }

  public loadCurrent(campaignId: CampaignId): Promise<unknown | undefined> {
    return this.#load("campaign_current", campaignId);
  }

  public loadRecovery(campaignId: CampaignId): Promise<unknown | undefined> {
    return this.#load("campaign_recovery", campaignId);
  }

  public async commitCurrent(snapshot: SaveSnapshot): Promise<void> {
    const transaction = this.#database.transaction(
      ["campaign_current", "campaign_recovery", "storage_metadata"],
      "readwrite",
    );
    const completed = transactionComplete(transaction);
    const currentStore = transaction.objectStore("campaign_current");
    const existingValue = await requestValue(
      currentStore.get(snapshot.campaignId),
    );
    if (existingValue !== undefined) {
      const existing = SaveSnapshotSchema.safeParse(existingValue);
      if (!existing.success || !saveSnapshotHashIsValid(existing.data)) {
        transaction.abort();
        await completed.catch(() => undefined);
        throw new CorruptCampaignSnapshotError(snapshot.campaignId);
      }
      if (snapshot.campaignRevision <= existing.data.campaignRevision) {
        transaction.abort();
        await completed.catch(() => undefined);
        throw new StaleCampaignRevisionError(
          snapshot.campaignId,
          existing.data.campaignRevision,
          snapshot.campaignRevision,
        );
      }
      transaction
        .objectStore("campaign_recovery")
        .put(existing.data, snapshot.campaignId);
    }
    currentStore.put(snapshot, snapshot.campaignId);
    transaction
      .objectStore("storage_metadata")
      .put(LOCAL_STORAGE_SCHEMA_VERSION, "localStorageSchemaVersion");
    await completed;
  }

  public async restoreCurrent(snapshot: SaveSnapshot): Promise<void> {
    const transaction = this.#database.transaction(
      ["campaign_current", "storage_metadata"],
      "readwrite",
    );
    const completed = transactionComplete(transaction);
    transaction
      .objectStore("campaign_current")
      .put(snapshot, snapshot.campaignId);
    transaction
      .objectStore("storage_metadata")
      .put(LOCAL_STORAGE_SCHEMA_VERSION, "localStorageSchemaVersion");
    await completed;
  }

  public close(): void {
    this.#database.close();
  }

  async #load(
    storeName: CampaignStoreName,
    campaignId: CampaignId,
  ): Promise<unknown | undefined> {
    const transaction = this.#database.transaction(storeName, "readonly");
    return requestValue(transaction.objectStore(storeName).get(campaignId));
  }
}

const parseStoredSnapshot = (
  campaignId: CampaignId,
  value: unknown | undefined,
): SaveSnapshot => {
  if (value === undefined) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }
  const parsed = SaveSnapshotSchema.safeParse(value);
  if (!parsed.success || !saveSnapshotHashIsValid(parsed.data)) {
    throw new CorruptCampaignSnapshotError(campaignId);
  }
  return structuredClone(parsed.data);
};

export class IndexedDbCampaignRepository implements CampaignRepository<AtomicCommandRepositoryTypes> {
  readonly #storage: BrowserCampaignStorage;

  public constructor(storage: BrowserCampaignStorage) {
    this.#storage = storage;
  }

  public async load(campaignIdValue: CampaignId): Promise<SaveSnapshot> {
    const campaignId = CampaignIdSchema.parse(campaignIdValue);
    return parseStoredSnapshot(
      campaignId,
      await this.#storage.loadCurrent(campaignId),
    );
  }

  public async loadRecovery(
    campaignIdValue: CampaignId,
  ): Promise<SaveSnapshot> {
    const campaignId = CampaignIdSchema.parse(campaignIdValue);
    return parseStoredSnapshot(
      campaignId,
      await this.#storage.loadRecovery(campaignId),
    );
  }

  public async recoverLastValid(
    campaignIdValue: CampaignId,
  ): Promise<SaveSnapshot> {
    const campaignId = CampaignIdSchema.parse(campaignIdValue);
    const snapshot = parseStoredSnapshot(
      campaignId,
      await this.#storage.loadRecovery(campaignId),
    );
    await this.#storage.restoreCurrent(structuredClone(snapshot));
    return snapshot;
  }

  public async writeLocal(snapshotValue: SaveSnapshot): Promise<void> {
    const snapshot = SaveSnapshotSchema.parse(snapshotValue);
    if (!saveSnapshotHashIsValid(snapshot)) {
      throw new CorruptCampaignSnapshotError(snapshot.campaignId);
    }
    const currentValue = await this.#storage.loadCurrent(snapshot.campaignId);
    if (currentValue !== undefined) {
      const current = SaveSnapshotSchema.safeParse(currentValue);
      if (!current.success || !saveSnapshotHashIsValid(current.data)) {
        throw new CorruptCampaignSnapshotError(snapshot.campaignId);
      }
      if (snapshot.campaignRevision <= current.data.campaignRevision) {
        throw new StaleCampaignRevisionError(
          snapshot.campaignId,
          current.data.campaignRevision,
          snapshot.campaignRevision,
        );
      }
    }
    try {
      await this.#storage.commitCurrent(structuredClone(snapshot));
    } catch (error) {
      if (
        error instanceof StaleCampaignRevisionError ||
        error instanceof CorruptCampaignSnapshotError
      ) {
        throw error;
      }
      throw new CampaignPersistenceError(snapshot.campaignId, error);
    }
  }

  public close(): void {
    this.#storage.close();
  }
}

export interface BrowserLockManager {
  request(
    name: string,
    options: { readonly mode: "exclusive" },
    callback: () => Promise<void>,
  ): Promise<void>;
}

export class WebLocksCampaignEditLock implements CampaignEditLock {
  readonly #locks: BrowserLockManager;

  public constructor(lockManager?: BrowserLockManager) {
    const locks = lockManager ?? globalThis.navigator?.locks;
    if (locks === undefined) {
      throw new BrowserPersistenceUnavailableError("web_locks");
    }
    this.#locks = locks;
  }

  public acquire(campaignIdValue: CampaignId): Promise<CampaignEditLease> {
    const campaignId = CampaignIdSchema.parse(campaignIdValue);
    let grant!: (lease: CampaignEditLease) => void;
    let rejectGrant!: (reason: unknown) => void;
    const granted = new Promise<CampaignEditLease>((resolve, reject) => {
      grant = resolve;
      rejectGrant = reject;
    });
    let release!: () => void;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    let held = true;
    const request = this.#locks.request(
      `african-mandate:campaign:${campaignId}`,
      { mode: "exclusive" },
      async () => {
        grant({
          campaignId,
          release: async () => {
            if (!held) throw new Error("Edit lease already released");
            held = false;
            release();
          },
        });
        await released;
      },
    );
    void request.catch(rejectGrant);
    return granted;
  }
}
