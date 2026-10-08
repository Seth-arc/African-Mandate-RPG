import { applicationPackage } from "@african-mandate/application";
import { domainPackage } from "@african-mandate/domain";

export const uiPackage = {
  name: "@african-mandate/ui",
  layer: "presentation-only-boundary",
  dependencies: [applicationPackage.name, domainPackage.name],
} as const;

export type UiPackageDescriptor = typeof uiPackage;
