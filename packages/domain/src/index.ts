export const domainPackage = {
  name: "@african-mandate/domain",
  layer: "domain-contract-boundary",
} as const;

export type DomainPackageDescriptor = typeof domainPackage;

export * from "./baseline.js";
export * from "./campaign.js";
export * from "./determinism-vectors.js";
export * from "./ids.js";
export * from "./json.js";
export * from "./references.js";
export * from "./scalars.js";
export * from "./scenario.js";
export * from "./versions.js";
