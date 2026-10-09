import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const fixture = fileURLToPath(
  new URL(
    "../tests/fixtures/forbidden-random/simulation-uses-random.ts",
    import.meta.url,
  ),
);
const eslintBin = fileURLToPath(
  new URL("../node_modules/eslint/bin/eslint.js", import.meta.url),
);
const result = spawnSync(process.execPath, [eslintBin, fixture], {
  encoding: "utf8",
});
const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

if (
  result.status !== 1 ||
  !output.includes("no-restricted-syntax") ||
  !output.includes("deterministic keyed randomness") ||
  !output.includes("Simulation-derived IDs must be deterministic")
) {
  console.error(output);
  console.error(
    `Expected forbidden randomness lint failures; received exit ${String(result.status)}.`,
  );
  process.exit(1);
}

console.log(
  "PASS: Math.random and randomUUID were rejected inside simulation scope.",
);
