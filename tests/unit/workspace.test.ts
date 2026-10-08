import { describe, expect, it } from "vitest";

import { applicationPackage } from "@african-mandate/application";
import { contentPackage } from "@african-mandate/content";
import { dataPipelinePackage } from "@african-mandate/data-pipeline";
import { domainPackage } from "@african-mandate/domain";
import { simulationPackage } from "@african-mandate/simulation";
import { toolingPackage } from "@african-mandate/tooling";
import { uiPackage } from "@african-mandate/ui";
import { webPackage } from "@african-mandate/web";

describe("workspace package graph", () => {
  it("exposes every requested package through its public root", () => {
    expect([
      domainPackage.name,
      simulationPackage.name,
      applicationPackage.name,
      dataPipelinePackage.name,
      contentPackage.name,
      uiPackage.name,
      webPackage.name,
      toolingPackage.name,
    ]).toEqual([
      "@african-mandate/domain",
      "@african-mandate/simulation",
      "@african-mandate/application",
      "@african-mandate/data-pipeline",
      "@african-mandate/content",
      "@african-mandate/ui",
      "@african-mandate/web",
      "@african-mandate/tooling",
    ]);
  });

  it("keeps the web shell behind application and UI boundaries", () => {
    expect(webPackage.dependencies).toEqual([
      "@african-mandate/application",
      "@african-mandate/domain",
      "@african-mandate/ui",
    ]);
    expect(webPackage.dependencies).not.toContain(
      "@african-mandate/simulation",
    );
  });
});
