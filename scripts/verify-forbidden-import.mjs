import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const fixture = fileURLToPath(
  new URL(
    "../tests/fixtures/forbidden-import/web-imports-simulation.ts",
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

if (result.status !== 1 || !output.includes("no-restricted-imports")) {
  console.error(output);
  console.error(
    `Expected forbidden import lint failure; received exit ${String(result.status)}.`,
  );
  process.exit(1);
}

console.log(
  "PASS: web-to-simulation import was rejected by no-restricted-imports.",
);
