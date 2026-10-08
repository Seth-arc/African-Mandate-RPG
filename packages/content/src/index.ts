import { domainPackage } from "@african-mandate/domain";

export const contentPackage = {
  name: "@african-mandate/content",
  layer: "authored-content-boundary",
  dependencies: [domainPackage.name],
} as const;

export type ContentPackageDescriptor = typeof contentPackage;
