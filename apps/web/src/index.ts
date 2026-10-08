import { applicationPackage } from "@african-mandate/application";
import { domainPackage } from "@african-mandate/domain";
import { uiPackage } from "@african-mandate/ui";

export const webPackage = {
  name: "@african-mandate/web",
  layer: "knowledge-safe-web-boundary",
  dependencies: [applicationPackage.name, domainPackage.name, uiPackage.name],
} as const;

export type WebPackageDescriptor = typeof webPackage;
