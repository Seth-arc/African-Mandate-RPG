import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { verifyMapDocumentArtifact } from "@african-mandate/application";

import {
  UiShell,
  UiShellModelSchema,
  type UiShellViewState,
} from "@african-mandate/ui";

import mapDocumentArtifact from "./test-map-document-artifact.json";
import { createTestDecisionWorkflow } from "./test-decision-workflow.js";

const mapDocumentProjection = verifyMapDocumentArtifact(
  mapDocumentArtifact,
  "7c5178d2ddcb54e127ff3eb7b6afdae2567d1cd5e8a39c295dcd949b3a383f73",
);

const queryState = new globalThis.URLSearchParams(
  globalThis.location.search,
).get("state");
const viewState: UiShellViewState =
  queryState === "loading" || queryState === "error" || queryState === "partial"
    ? queryState
    : "ready";
const decisionScenario = new globalThis.URLSearchParams(
  globalThis.location.search,
).get("decisionScenario");
const decisionWorkflow = createTestDecisionWorkflow({
  failFirstSave: decisionScenario === "adverse",
});

const model = UiShellModelSchema.parse({
  schemaVersion: 1,
  contractVersion: "0.1.0-test.1",
  classification: "TEST_ONLY_UI_SHELL",
  campaignRevision: 0,
  currentTurn: 1,
  maxTurns: 20,
  currentDate: "2025-10-01",
  decisionsRemaining: 3,
  decisionsPerTurn: 3,
  campaignStatus: "active",
  saveState: {
    localStatus: "saved",
    syncStatus: "unavailable",
    detail:
      "The campaign is durable on this device. Cloud sync is unavailable.",
  },
  attentionItems: [
    {
      id: "ui_attention_review_brief",
      severity: "warning",
      title: "Review the simulated monthly brief",
      destinationId: "campaign-workspace",
    },
    {
      id: "ui_attention_check_reporting",
      severity: "info",
      title: "Review incomplete reporting",
      destinationId: "campaign-workspace",
    },
  ],
});

const root = globalThis.document.querySelector<HTMLElement>("#root");
if (root === null) throw new Error("Web root element is missing");

createRoot(root).render(
  <StrictMode>
    <UiShell
      model={model}
      state={viewState}
      mapDocuments={mapDocumentProjection}
      decisionWorkflow={decisionWorkflow}
    />
  </StrictMode>,
);
