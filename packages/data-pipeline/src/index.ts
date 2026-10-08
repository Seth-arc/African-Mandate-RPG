import { domainPackage } from "@african-mandate/domain";

export const dataPipelinePackage = {
  name: "@african-mandate/data-pipeline",
  layer: "source-compiler-boundary",
  dependencies: [domainPackage.name],
} as const;

export type DataPipelinePackageDescriptor = typeof dataPipelinePackage;
