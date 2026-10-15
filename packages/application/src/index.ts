import { domainPackage } from "@african-mandate/domain";
import { simulationPackage } from "@african-mandate/simulation";

export const applicationPackage = {
  name: "@african-mandate/application",
  layer: "operation-and-projection-port-boundary",
  dependencies: [domainPackage.name, simulationPackage.name],
} as const;

export type ApplicationPackageDescriptor = typeof applicationPackage;

export * from "./atomic-command-service.js";
export * from "./atomic-turn-service.js";
export * from "./artifact-registry.js";
export * from "./browser-persistence.js";
export * from "./decision-workflow.js";
export * from "./map-documents.js";
export * from "./narrative-service.js";
export * from "./operation-coordinator.js";
export * from "./ports.js";
export * from "./projections.js";
export * from "./production-runtime.js";
export * from "./sync-status.js";
export * from "./testing/in-memory-adapters.js";
