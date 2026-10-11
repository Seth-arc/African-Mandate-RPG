import { applicationPackage } from "@african-mandate/application";
import { contentPackage } from "@african-mandate/content";
import { dataPipelinePackage } from "@african-mandate/data-pipeline";
import { domainPackage } from "@african-mandate/domain";
import { narrativePackage } from "@african-mandate/narrative";
import { simulationPackage } from "@african-mandate/simulation";

export const headlessPackage = {
  name: "@african-mandate/headless",
  layer: "test-only-independent-acceptance",
  dependencies: [
    domainPackage.name,
    simulationPackage.name,
    applicationPackage.name,
    contentPackage.name,
    dataPipelinePackage.name,
    narrativePackage.name,
  ],
} as const;

export type HeadlessPackageDescriptor = typeof headlessPackage;

export * from "./headless-acceptance.js";
