import { domainPackage } from "@african-mandate/domain";
import { simulationPackage } from "@african-mandate/simulation";

export const applicationPackage = {
  name: "@african-mandate/application",
  layer: "operation-and-projection-port-boundary",
  dependencies: [domainPackage.name, simulationPackage.name],
} as const;

export type ApplicationPackageDescriptor = typeof applicationPackage;
