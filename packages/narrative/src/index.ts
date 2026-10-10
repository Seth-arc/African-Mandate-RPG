import { domainPackage } from "@african-mandate/domain";

export const narrativePackage = {
  name: "@african-mandate/narrative",
  layer: "knowledge-safe-plain-text-presentation",
  dependencies: [domainPackage.name],
} as const;

export type NarrativePackageDescriptor = typeof narrativePackage;

export * from "./narrative-port.js";
