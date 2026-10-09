import { domainPackage } from "@african-mandate/domain";
import { simulationPackage } from "@african-mandate/simulation";

export const applicationPackage = {
  name: "@african-mandate/application",
  layer: "operation-and-projection-port-boundary",
  dependencies: [domainPackage.name, simulationPackage.name],
} as const;

export type ApplicationPackageDescriptor = typeof applicationPackage;

export * from "./operation-coordinator.js";
export * from "./ports.js";
export * from "./testing/in-memory-adapters.js";
