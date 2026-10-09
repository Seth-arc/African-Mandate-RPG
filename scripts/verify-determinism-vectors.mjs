import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));
const tsxCli = fileURLToPath(
  new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url),
);
const emitter = fileURLToPath(
  new URL("./emit-determinism-vectors.ts", import.meta.url),
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
    console.error(`${label} determinism process failed`);
    console.error(result.stderr);
    process.exit(result.status ?? 1);
  }
}

if (first.stdout !== second.stdout) {
  console.error("Fresh determinism processes produced different byte output.");
  process.exit(1);
}

console.log(
  "PASS: two fresh processes produced identical deterministic bytes.",
);
console.log(first.stdout.trim());
