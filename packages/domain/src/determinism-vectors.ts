import { z } from "zod";

const Sha256HexSchema = z.string().regex(/^[a-f0-9]{64}$/u);

export const DeterminismVectorArtifactSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    artifactId: z.literal("technical-v2-random-vectors"),
    classification: z.literal("CANONICAL_SOURCE_VECTOR"),
    provenance: z
      .object({
        sourcePath: z.literal(
          "docs/AFRICAN_MANDATE_TECHNICAL_ARCHITECTURE_v2.md",
        ),
        sourceSha256: Sha256HexSchema,
        sourceSection: z.literal("14.1 Required random test vectors"),
        seedScopeNote: z.string().min(1),
      })
      .strict(),
    campaignSeed: z.string().min(1),
    vectors: z
      .array(
        z
          .object({
            vectorId: z.enum(["A", "B"]),
            resolutionKey: z.string().min(1),
            expectedSha256: Sha256HexSchema,
            expectedSample: z.number().min(0).lt(1),
          })
          .strict(),
      )
      .length(2),
  })
  .strict()
  .superRefine((artifact, ctx) => {
    if (new Set(artifact.vectors.map((vector) => vector.vectorId)).size !== 2) {
      ctx.addIssue({
        code: "custom",
        message:
          "The artifact must contain source vectors A and B exactly once",
        path: ["vectors"],
      });
    }
  });

export type DeterminismVectorArtifact = z.infer<
  typeof DeterminismVectorArtifactSchema
>;
