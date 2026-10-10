import { domainPackage } from "@african-mandate/domain";

export const simulationPackage = {
  name: "@african-mandate/simulation",
  layer: "deterministic-engine-boundary",
  dependencies: [domainPackage.name],
} as const;

export type SimulationPackageDescriptor = typeof simulationPackage;

export * from "./atomic-command.js";
export * from "./actors.js";
export * from "./assessments.js";
export * from "./command-rules.js";
export * from "./determinism/canonical-json.js";
export * from "./determinism/primitives.js";
export * from "./determinism/sha256.js";
export * from "./mandatory-attention.js";
export * from "./knowledge.js";
export * from "./turn-engine.js";
export * from "./world-resolvers.js";
