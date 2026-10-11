import { applicationPackage } from "@african-mandate/application";

import "./styles.css";

export const uiPackage = {
  name: "@african-mandate/ui",
  layer: "presentation-only-boundary",
  dependencies: [applicationPackage.name],
} as const;

export type UiPackageDescriptor = typeof uiPackage;

export * from "./ui-shell-model.js";
export * from "./ui-shell.js";
