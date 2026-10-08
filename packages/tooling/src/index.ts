export const toolingPackage = {
  name: "@african-mandate/tooling",
  layer: "build-and-verification-boundary",
} as const;

export type ToolingPackageDescriptor = typeof toolingPackage;
