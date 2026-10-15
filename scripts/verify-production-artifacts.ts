import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  MapArtifactManifestSchema,
  ReleaseManifestSchema,
} from "@african-mandate/application";
import {
  BaselinePackageSchema,
  MethodologyManifestSchema,
  ScenarioBundleSchema,
} from "@african-mandate/domain";
import { assertProductionClassification } from "@african-mandate/data-pipeline";

const root = resolve(import.meta.dirname, "..");
const production = resolve(root, "apps/web/public/production");
const sha256 = (value: Uint8Array | string): string =>
  createHash("sha256").update(value).digest("hex");

const compile = async (run: number): Promise<void> => {
  await import(`./compile-production-artifacts.ts?verify=${String(run)}`);
};

const fileHashes = async (): Promise<Readonly<Record<string, string>>> => {
  const hashManifest = JSON.parse(
    await readFile(resolve(production, "artifact-hashes.json"), "utf8"),
  ) as { artifacts: Record<string, string> };
  return Object.fromEntries(
    await Promise.all(
      Object.keys(hashManifest.artifacts)
        .sort()
        .map(async (name) => {
          const path = name.startsWith("african_map.")
            ? resolve(production, "..", "assets", name)
            : resolve(production, name);
          return [name, sha256(await readFile(path))] as const;
        }),
    ),
  );
};

await compile(1);
const first = await fileHashes();
await compile(2);
const second = await fileHashes();
if (JSON.stringify(first) !== JSON.stringify(second)) {
  throw new Error("Two production compilations were not byte-identical");
}

const expected = JSON.parse(
  await readFile(resolve(production, "artifact-hashes.json"), "utf8"),
) as { artifacts: Record<string, string> };
for (const [name, hash] of Object.entries(second)) {
  if (expected.artifacts[name] !== hash) {
    throw new Error(`Production artifact hash mismatch: ${name}`);
  }
}

const artifacts = [
  ReleaseManifestSchema.parse(
    JSON.parse(
      await readFile(resolve(production, "release.manifest.json"), "utf8"),
    ),
  ),
  ScenarioBundleSchema.parse(
    JSON.parse(
      await readFile(resolve(production, "scenario.bundle.json"), "utf8"),
    ),
  ),
  BaselinePackageSchema.parse(
    JSON.parse(
      await readFile(resolve(production, "baseline.package.json"), "utf8"),
    ),
  ),
  MethodologyManifestSchema.parse(
    JSON.parse(
      await readFile(resolve(production, "methodology.manifest.json"), "utf8"),
    ),
  ),
  MapArtifactManifestSchema.parse(
    JSON.parse(
      await readFile(resolve(production, "map.manifest.json"), "utf8"),
    ),
  ),
];
artifacts.forEach(assertProductionClassification);

console.log(
  `PASS: production artifacts are schema-valid, TEST_ONLY-free, hash-pinned, and byte-identical across two compilations (${String(Object.keys(second).length)} files).`,
);
