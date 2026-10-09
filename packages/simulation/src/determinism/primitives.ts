import { sha256Bytes, sha256Hex, utf8Bytes } from "./sha256.js";

const NULL_SEPARATOR = "\0";
const TWO_TO_THE_53 = 9_007_199_254_740_992;

const assertDelimitedComponent = (value: string, name: string): void => {
  if (value.includes(NULL_SEPARATOR)) {
    throw new TypeError(`${name} must not contain a NUL delimiter`);
  }
};

export interface DeterministicSampleResult {
  readonly digestHex: string;
  readonly sample: number;
}

export const deterministicSampleWithDigest = (
  campaignSeed: string,
  resolutionKey: string,
): DeterministicSampleResult => {
  assertDelimitedComponent(campaignSeed, "campaignSeed");
  assertDelimitedComponent(resolutionKey, "resolutionKey");
  const digest = sha256Bytes(
    utf8Bytes(`${campaignSeed}${NULL_SEPARATOR}${resolutionKey}`),
  );
  let first56Bits = 0n;
  for (let index = 0; index < 7; index += 1) {
    first56Bits = (first56Bits << 8n) | BigInt(digest[index]!);
  }
  const first53Bits = first56Bits >> 3n;
  return {
    digestHex: Array.from(digest, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join(""),
    sample: Number(first53Bits) / TWO_TO_THE_53,
  };
};

export const deterministicSample = (
  campaignSeed: string,
  resolutionKey: string,
): number => deterministicSampleWithDigest(campaignSeed, resolutionKey).sample;

export interface SimulationIdInput {
  readonly entityType: string;
  readonly campaignSeed: string;
  readonly resolutionKey: string;
  readonly ordinal: number;
}

export type DerivedIdRegistry = Readonly<Record<string, string>>;

export class DerivedIdCollisionError extends Error {
  public constructor(id: string) {
    super(`Derived simulation ID collision: ${id}`);
    this.name = "DerivedIdCollisionError";
  }
}

export const simulationIdMaterial = (input: SimulationIdInput): string => {
  if (!/^[a-z][a-z0-9_]*$/u.test(input.entityType)) {
    throw new TypeError("entityType must be a lowercase domain prefix");
  }
  if (!Number.isSafeInteger(input.ordinal) || input.ordinal < 0) {
    throw new TypeError("ordinal must be a non-negative safe integer");
  }
  assertDelimitedComponent(input.entityType, "entityType");
  assertDelimitedComponent(input.campaignSeed, "campaignSeed");
  assertDelimitedComponent(input.resolutionKey, "resolutionKey");
  return [
    input.campaignSeed,
    input.entityType,
    input.resolutionKey,
    String(input.ordinal),
  ].join(NULL_SEPARATOR);
};

export const deriveSimulationId = (
  input: SimulationIdInput,
  registry: DerivedIdRegistry = {},
): string => {
  const material = simulationIdMaterial(input);
  const id = `${input.entityType}_${sha256Hex(material).slice(0, 24)}`;
  const existingMaterial = registry[id];
  if (existingMaterial !== undefined && existingMaterial !== material) {
    throw new DerivedIdCollisionError(id);
  }
  return id;
};

export const roundHalfAwayFromZero = (value: number): number => {
  if (!Number.isFinite(value)) {
    throw new TypeError("roundHalfAwayFromZero requires a finite number");
  }
  const rounded =
    value < 0 ? -Math.floor(-value + 0.5) : Math.floor(value + 0.5);
  return Object.is(rounded, -0) ? 0 : rounded;
};
