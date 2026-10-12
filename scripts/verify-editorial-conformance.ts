import { readFile } from "node:fs/promises";
import ts from "typescript";

import {
  HumanApprovalRegisterSchema,
  auditEditorialCopy,
  auditTokenReferences,
  type EditorialSourceText,
} from "@african-mandate/tooling";

const root = new URL("../", import.meta.url);

const read = async (path: string): Promise<string> =>
  readFile(new URL(path, root), "utf8");

const sourcePaths = [
  "packages/ui/src/ui-shell.tsx",
  "packages/ui/src/decision-workspace.tsx",
  "packages/ui/src/map-documents.tsx",
  "packages/narrative/src/narrative-port.ts",
  "apps/web/src/main.tsx",
  "apps/web/src/test-decision-workflow.ts",
] as const;

const extractStrings = (
  sourceId: string,
  source: string,
): EditorialSourceText => {
  const file = ts.createSourceFile(
    sourceId,
    source,
    ts.ScriptTarget.Latest,
    true,
    sourceId.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const strings: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isJsxText(node)
    ) {
      const value = node.text.trim();
      if (value.length > 0) strings.push(value);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return { sourceId, text: strings.join("\n") };
};

const collectJsonStrings = (value: unknown, output: string[]): void => {
  if (typeof value === "string") {
    output.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonStrings(item, output));
    return;
  }
  if (typeof value === "object" && value !== null) {
    Object.values(value).forEach((item) => collectJsonStrings(item, output));
  }
};

const rawSources = await Promise.all(
  sourcePaths.map(async (path) => ({ path, source: await read(path) })),
);
const sourceEntries = rawSources.map(({ path, source }) =>
  extractStrings(path, source),
);
const mapFixtureText = await read(
  "apps/web/src/test-map-document-artifact.json",
);
const mapFixture = JSON.parse(mapFixtureText) as {
  readonly documents: readonly {
    readonly metadata: {
      readonly date: string;
      readonly classification: string;
      readonly preparer: string;
    };
  }[];
};
const fixtureStrings: string[] = [];
collectJsonStrings(mapFixture, fixtureStrings);
sourceEntries.push({
  sourceId: "apps/web/src/test-map-document-artifact.json",
  text: fixtureStrings.join("\n"),
});

const copyAudit = auditEditorialCopy(sourceEntries);
if (copyAudit.failures.length > 0 || copyAudit.reviews.length > 0) {
  throw new Error(
    `Editorial copy audit found ${String(copyAudit.failures.length)} failure(s) and ${String(copyAudit.reviews.length)} unresolved review item(s): ${JSON.stringify([...copyAudit.failures, ...copyAudit.reviews])}`,
  );
}

const tokenSource = await read("docs/tokens.css");
const componentCss = await read("packages/ui/src/styles.css");
const missingTokens = auditTokenReferences(tokenSource, componentCss);
if (missingTokens.length > 0) {
  throw new Error(`Undefined UI token references: ${missingTokens.join(", ")}`);
}
if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/iu.test(componentCss)) {
  throw new Error("UI component CSS contains a raw colour outside tokens.css.");
}
if (
  /font-size:\s*[\d.]+(?:px|rem|em)|border-radius:\s*[\d.]+|(transition|animation)[^;]*[\d.]+m?s/iu.test(
    componentCss,
  )
) {
  throw new Error(
    "UI component CSS bypasses typography, radius, or motion tokens.",
  );
}
if (
  /<(?:div|span)[^>]*(?:onClick|role=["']button["'])/u.test(
    rawSources.map(({ source }) => source).join("\n"),
  )
) {
  throw new Error("UI source contains a non-semantic interactive element.");
}

for (const document of mapFixture.documents) {
  if (
    document.metadata.classification !== "SIMULATED" ||
    !document.metadata.preparer.includes("(Simulated)")
  ) {
    throw new Error("Every test document requires its simulated marker.");
  }
  if (document.metadata.date !== "2025-10-01") {
    throw new Error("Opening test document date drifted from 1 October 2025.");
  }
}

const decisionFixture = await read("apps/web/src/test-decision-workflow.ts");
for (const date of ["2025-10-01", "2025-11-01", "2025-12-01", "2026-01-01"]) {
  if (!decisionFixture.includes(date)) {
    throw new Error(`Four-month decision fixture is missing ${date}.`);
  }
}

const approvalRegister = HumanApprovalRegisterSchema.parse(
  JSON.parse(await read("docs/build/EDITORIAL_APPROVAL_REGISTER.json")),
);
if (approvalRegister.entries.some(({ status }) => status === "APPROVED")) {
  throw new Error("Prompt 24 must not claim an unrun human approval.");
}

console.log(
  "PASS: copy/glossary markers, dates, token references, component semantics, and fail-closed human approvals conform.",
);
