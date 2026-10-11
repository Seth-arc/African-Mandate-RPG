import { applicationPackage } from "@african-mandate/application";

export const uiPackage = {
  name: "@african-mandate/ui",
  layer: "presentation-only-boundary",
  dependencies: [applicationPackage.name],
} as const;

export type UiPackageDescriptor = typeof uiPackage;
