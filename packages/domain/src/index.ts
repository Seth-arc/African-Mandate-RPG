export const domainPackage = {
  name: "@african-mandate/domain",
  layer: "domain-contract-boundary",
} as const;

export type DomainPackageDescriptor = typeof domainPackage;
