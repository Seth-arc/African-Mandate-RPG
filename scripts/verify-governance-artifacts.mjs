import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const state = JSON.parse(
  await readFile(new URL("docs/build/BUILD_STATE.json", root), "utf8"),
);
const schema = JSON.parse(
  await readFile(
    new URL("docs/build/schemas/build-state.schema.json", root),
    "utf8",
  ),
);
const toolchain = JSON.parse(
  await readFile(new URL("toolchain.json", root), "utf8"),
);
const toolchainSchema = JSON.parse(
  await readFile(
    new URL("packages/tooling/schemas/toolchain.schema.json", root),
    "utf8",
  ),
);
const manifestBytes = await readFile(
  new URL("docs/build/SOURCE_MANIFEST.md", root),
);
const manifestHash = createHash("sha256").update(manifestBytes).digest("hex");
const expectedPrompts = Array.from({ length: 30 }, (_, index) =>
  String(index).padStart(2, "0"),
);
const statuses = new Set(schema.$defs.promptState.properties.status.enum);

const fail = (message) => {
  throw new Error(message);
};

if (state.schemaVersion !== schema.properties.schemaVersion.const)
  fail("Build-state version mismatch.");
if (state.sourceManifestHash !== manifestHash)
  fail("Source-manifest hash mismatch.");
if (
  JSON.stringify(Object.keys(state.prompts).sort()) !==
  JSON.stringify(expectedPrompts)
) {
  fail("BUILD_STATE must contain exactly prompts 00 through 29.");
}
for (const [promptId, prompt] of Object.entries(state.prompts)) {
  if (!statuses.has(prompt.status)) fail(`${promptId}: invalid status.`);
  const approved =
    prompt.status === "ACCEPTED" || prompt.status === "DEFERRED_APPROVED";
  if (
    approved &&
    (!prompt.approvedCommit || !prompt.approver || !prompt.evidencePath)
  ) {
    fail(`${promptId}: approved state lacks independent evidence.`);
  }
  if (
    !approved &&
    (prompt.approvedCommit !== null || prompt.approver !== null)
  ) {
    fail(`${promptId}: unapproved state claims approval.`);
  }
}

const toolchainProperties = toolchainSchema.properties;
for (const field of toolchainSchema.required) {
  if (!(field in toolchain)) fail(`toolchain.json lacks ${field}.`);
}
for (const field of [
  "schemaVersion",
  "contractStatus",
  "node",
  "pnpm",
  "corepack",
  "typescript",
]) {
  if (toolchain[field] !== toolchainProperties[field].const)
    fail(`Toolchain ${field} mismatch.`);
}
if (process.version !== `v${toolchain.node}`)
  fail("Executing Node version does not match toolchain.json.");
if (
  !(process.env.npm_config_user_agent ?? "").startsWith(
    `pnpm/${toolchain.pnpm} `,
  )
)
  fail("Executing pnpm version does not match toolchain.json.");
if (
  toolchain.typescriptRunner.name !==
    toolchainProperties.typescriptRunner.properties.name.const ||
  toolchain.typescriptRunner.version !==
    toolchainProperties.typescriptRunner.properties.version.const
)
  fail("TypeScript runner does not match the public toolchain schema.");
if (toolchain.browserMatrix !== null || toolchain.basemapProvider !== null) {
  fail("Unapproved browser matrix or basemap provider was asserted.");
}
if (toolchain.gisTools.length !== 0)
  fail("Unapproved GIS tooling was asserted.");

console.log(
  "PASS: governance and toolchain artifacts match their public schemas.",
);
