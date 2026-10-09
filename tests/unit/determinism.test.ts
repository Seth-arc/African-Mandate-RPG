import { describe, expect, it } from "vitest";

import { DeterminismVectorArtifactSchema } from "@african-mandate/domain";
import {
  CanonicalJsonError,
  DerivedIdCollisionError,
  bytesToLowerHex,
  canonicalJson,
  deriveSimulationId,
  deterministicSample,
  deterministicSampleWithDigest,
  freezeJsonSnapshot,
  hashCanonicalJson,
  hashImmutableSnapshot,
  roundHalfAwayFromZero,
  sha256Hex,
  simulationIdMaterial,
  utf8Bytes,
} from "@african-mandate/simulation";
import sourceVectors from "../fixtures/determinism/technical-v2-random-vectors.json";

const webCryptoSha256 = async (value: string): Promise<string> => {
  const bytes = utf8Bytes(value);
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    bytes.slice().buffer,
  );
  return bytesToLowerHex(new Uint8Array(digest));
};

describe("deterministic primitives", () => {
  it("matches both byte-exact Technical v2 random vectors", () => {
    const artifact = DeterminismVectorArtifactSchema.parse(sourceVectors);
    for (const vector of artifact.vectors) {
      const result = deterministicSampleWithDigest(
        artifact.campaignSeed,
        vector.resolutionKey,
      );
      expect(result.digestHex).toBe(vector.expectedSha256);
      expect(result.sample).toBe(vector.expectedSample);
    }
  });

  it("matches Web Crypto in the Node test runtime and for Unicode bytes", async () => {
    const values = [
      "",
      "African Mandate",
      "Sahel—Mopti",
      "é",
      "e\u0301",
      "turn:01|system:event_director",
    ];
    for (const value of values) {
      await expect(webCryptoSha256(value)).resolves.toBe(sha256Hex(value));
    }
  });

  it("does not silently normalize Unicode", () => {
    const composed = "é";
    const decomposed = "e\u0301";
    expect(composed.normalize("NFD")).toBe(decomposed);
    expect(canonicalJson(composed)).not.toBe(canonicalJson(decomposed));
    expect(hashCanonicalJson(composed)).not.toBe(hashCanonicalJson(decomposed));
  });

  it("canonicalizes unordered object keys but preserves array order", () => {
    const first = { z: 1, nested: { b: true, a: false }, a: 2 };
    const second = { a: 2, nested: { a: false, b: true }, z: 1 };
    expect(canonicalJson(first)).toBe(
      '{"a":2,"nested":{"a":false,"b":true},"z":1}',
    );
    expect(hashCanonicalJson(first)).toBe(hashCanonicalJson(second));
    expect(hashCanonicalJson(["a", "b"])).not.toBe(
      hashCanonicalJson(["b", "a"]),
    );
  });

  it("hashes canonical UTF-8 bytes identically to Web Crypto", async () => {
    const value = {
      versions: { simulation: "test-only-v1", schema: 1 },
      meta: { turn: 1, negativeZero: -0 },
      ordered: ["first", "second"],
    };
    const serialized = canonicalJson(value);
    await expect(webCryptoSha256(serialized)).resolves.toBe(
      hashCanonicalJson(value),
    );
  });

  it("normalizes negative zero and rounds halves away from zero", () => {
    expect(canonicalJson(-0)).toBe("0");
    expect(hashCanonicalJson(-0)).toBe(hashCanonicalJson(0));
    expect(roundHalfAwayFromZero(1.5)).toBe(2);
    expect(roundHalfAwayFromZero(1.49)).toBe(1);
    expect(roundHalfAwayFromZero(-1.5)).toBe(-2);
    expect(roundHalfAwayFromZero(-1.49)).toBe(-1);
    expect(Object.is(roundHalfAwayFromZero(-0.1), -0)).toBe(false);
  });

  it.each([
    ["undefined", undefined],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["Date", new Date("2025-10-01T00:00:00Z")],
    ["Map", new Map()],
    ["Set", new Set()],
    ["BigInt", 1n],
    ["symbol", Symbol("test")],
    ["function", () => true],
  ])("rejects prohibited %s values", (_label, value) => {
    expect(() => canonicalJson(value)).toThrow(CanonicalJsonError);
  });

  it("rejects sparse arrays, accessors, and cycles", () => {
    const sparse: unknown[] = [];
    sparse.length = 1;
    const accessor = Object.defineProperty({}, "hidden", {
      enumerable: true,
      get: () => 1,
    });
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    expect(() => canonicalJson(sparse)).toThrow(CanonicalJsonError);
    expect(() => canonicalJson(accessor)).toThrow(CanonicalJsonError);
    expect(() => canonicalJson(cyclic)).toThrow(CanonicalJsonError);
  });

  it("derives stable 96-bit IDs and fails closed on a collision", async () => {
    const input = {
      entityType: "consequence",
      campaignSeed: "campaign-test-seed",
      resolutionKey: "turn:01|decision:decision_schema_example",
      ordinal: 0,
    } as const;
    const material = simulationIdMaterial(input);
    const expectedDigest = await webCryptoSha256(material);
    const id = deriveSimulationId(input);
    expect(id).toBe(`consequence_${expectedDigest.slice(0, 24)}`);
    expect(deriveSimulationId(input)).toBe(id);
    expect(deriveSimulationId({ ...input, ordinal: 1 })).not.toBe(id);
    expect(() =>
      deriveSimulationId(input, { [id]: "different-entity" }),
    ).toThrow(DerivedIdCollisionError);
  });

  it("rejects delimiter ambiguity and invalid numeric inputs", () => {
    expect(() => deterministicSample("seed\0other", "key")).toThrow(TypeError);
    expect(() =>
      deriveSimulationId({
        entityType: "consequence",
        campaignSeed: "seed",
        resolutionKey: "key\0other",
        ordinal: 0,
      }),
    ).toThrow(TypeError);
    expect(() =>
      deriveSimulationId({
        entityType: "Consequence",
        campaignSeed: "seed",
        resolutionKey: "key",
        ordinal: 0,
      }),
    ).toThrow(TypeError);
    expect(() =>
      deriveSimulationId({
        entityType: "consequence",
        campaignSeed: "seed",
        resolutionKey: "key",
        ordinal: -1,
      }),
    ).toThrow(TypeError);
    expect(() => roundHalfAwayFromZero(Number.NaN)).toThrow(TypeError);
    expect(() => roundHalfAwayFromZero(Number.POSITIVE_INFINITY)).toThrow(
      TypeError,
    );
  });

  it("changes hashes and samples when source inputs change", () => {
    expect(hashCanonicalJson({ value: 1 })).not.toBe(
      hashCanonicalJson({ value: 2 }),
    );
    expect(deterministicSample("seed", "resolution:a")).not.toBe(
      deterministicSample("seed", "resolution:b"),
    );
  });

  it("hashes only deeply frozen snapshots through the immutable API", () => {
    const mutable = { meta: { turn: 1 }, decisions: [] as string[] };
    expect(() => hashImmutableSnapshot(mutable)).toThrow(TypeError);
    const snapshot = freezeJsonSnapshot(mutable);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.meta)).toBe(true);
    expect(Object.isFrozen(snapshot.decisions)).toBe(true);
    expect(hashImmutableSnapshot(snapshot)).toBe(hashCanonicalJson(snapshot));
  });
});
