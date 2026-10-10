export const domainPackage = {
  name: "@african-mandate/domain",
  layer: "domain-contract-boundary",
} as const;

export type DomainPackageDescriptor = typeof domainPackage;

export * from "./actor-operations.js";
export * from "./actor-state.js";
export * from "./assessment-operations.js";
export * from "./assessment-state.js";
export * from "./atomic-commit.js";
export * from "./baseline.js";
export * from "./campaign.js";
export * from "./commands.js";
export * from "./determinism-vectors.js";
export * from "./ids.js";
export * from "./json.js";
export * from "./knowledge-operations.js";
export * from "./knowledge-state.js";
export * from "./lifecycle-state.js";
export * from "./references.js";
export * from "./rules.js";
export * from "./scalars.js";
export * from "./scenario.js";
export * from "./turn-lifecycle.js";
export * from "./versions.js";
export * from "./world-state.js";
export * from "./world-resolver-contract.js";
