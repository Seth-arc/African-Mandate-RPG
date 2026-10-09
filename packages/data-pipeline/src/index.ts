import { domainPackage } from "@african-mandate/domain";

export const dataPipelinePackage = {
  name: "@african-mandate/data-pipeline",
  layer: "source-compiler-boundary",
  dependencies: [domainPackage.name],
} as const;

export type DataPipelinePackageDescriptor = typeof dataPipelinePackage;

export * from "./canonical/canonical-json.js";
export * from "./compilation/compile-synthetic-fixture.js";
export * from "./geography/assign-points.js";
export * from "./schemas/fixture-artifacts.js";
