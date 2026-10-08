import { domainPackage } from "@african-mandate/domain";

export const simulationPackage = {
  name: "@african-mandate/simulation",
  layer: "deterministic-engine-boundary",
  dependencies: [domainPackage.name],
} as const;

export type SimulationPackageDescriptor = typeof simulationPackage;
