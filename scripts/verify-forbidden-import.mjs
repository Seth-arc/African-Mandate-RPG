import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const fixtures = [
  {
    label: "web-to-simulation",
    path: "../tests/fixtures/forbidden-import/web-imports-simulation.ts",
  },
  {
    label: "ui-to-domain",
    path: "../tests/fixtures/forbidden-import/ui-imports-domain.ts",
  },
  {
    label: "ui-to-simulation",
    path: "../tests/fixtures/forbidden-import/ui-imports-simulation.ts",
  },
];
const eslintBin = fileURLToPath(
  new URL("../node_modules/eslint/bin/eslint.js", import.meta.url),
);
for (const fixture of fixtures) {
  const fixturePath = fileURLToPath(new URL(fixture.path, import.meta.url));
  const result = spawnSync(process.execPath, [eslintBin, fixturePath], {
    encoding: "utf8",
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 1 || !output.includes("no-restricted-imports")) {
    console.error(output);
    console.error(
      `Expected ${fixture.label} forbidden import lint failure; received exit ${String(result.status)}.`,
    );
    process.exit(1);
  }
  console.log(
    `PASS: ${fixture.label} import was rejected by no-restricted-imports.`,
  );
}
