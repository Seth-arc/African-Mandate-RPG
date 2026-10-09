import { DeterminismVectorArtifactSchema } from "@african-mandate/domain";
import {
  canonicalJson,
  deriveSimulationId,
  deterministicSampleWithDigest,
  hashCanonicalJson,
  roundHalfAwayFromZero,
} from "@african-mandate/simulation";
import sourceVectors from "../tests/fixtures/determinism/technical-v2-random-vectors.json";

const artifact = DeterminismVectorArtifactSchema.parse(sourceVectors);
const vectors = artifact.vectors.map((vector) => {
  const actual = deterministicSampleWithDigest(
    artifact.campaignSeed,
    vector.resolutionKey,
  );
  if (
    actual.digestHex !== vector.expectedSha256 ||
    actual.sample !== vector.expectedSample
  ) {
    throw new Error(`Technical v2 vector ${vector.vectorId} mismatch`);
  }
  return { vectorId: vector.vectorId, ...actual };
});

const canonicalFixture = {
  versions: { simulation: "test-only-v1", schema: 1 },
  meta: { turn: 1, negativeZero: -0 },
  ordered: ["first", "second"],
};

const output = {
  vectors,
  canonicalJson: canonicalJson(canonicalFixture),
  canonicalHash: hashCanonicalJson(canonicalFixture),
  derivedId: deriveSimulationId({
    entityType: "consequence",
    campaignSeed: artifact.campaignSeed,
    resolutionKey: artifact.vectors[0]!.resolutionKey,
    ordinal: 0,
  }),
  rounding: [
    roundHalfAwayFromZero(-1.5),
    roundHalfAwayFromZero(-0.5),
    roundHalfAwayFromZero(0.5),
    roundHalfAwayFromZero(1.5),
  ],
};

console.log(canonicalJson(output));
