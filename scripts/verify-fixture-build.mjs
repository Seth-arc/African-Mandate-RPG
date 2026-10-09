import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));
const tsxCli = fileURLToPath(
  new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url),
);
const emitter = fileURLToPath(
  new URL("./emit-fixture-build.ts", import.meta.url),
);

const runFreshProcess = () =>
  spawnSync(process.execPath, [tsxCli, emitter], {
    cwd: workspaceRoot,
    encoding: "utf8",
    env: process.env,
  });

const first = runFreshProcess();
const second = runFreshProcess();

for (const [label, result] of [
  ["first", first],
  ["second", second],
]) {
  if (result.status !== 0) {
    console.error(`${label} fixture build failed`);
    console.error(result.stderr);
    process.exit(result.status ?? 1);
  }
}

if (first.stdout !== second.stdout) {
  console.error("Fresh fixture builds produced different canonical bytes.");
  process.exit(1);
}

const files = JSON.parse(first.stdout);
const fixtureHashes = JSON.parse(files["fixture-expected-hashes.json"]).hashes;
console.log(
  "PASS: two fresh fixture builds produced byte-identical artifacts.",
);
console.log(
  JSON.stringify({
    artifactNames: Object.keys(files).sort(),
    fixtureBaselineBytes: files["fixture-baseline.json"].length,
    fixtureHashes,
  }),
);
