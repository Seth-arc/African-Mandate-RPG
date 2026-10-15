import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";

import {
  createProductionRuntime,
  verifyMapDocumentArtifact,
} from "@african-mandate/application";
import {
  UiShell,
  UiShellModelSchema,
  type UiDecisionWorkflow,
  type UiShellViewState,
} from "@african-mandate/ui";

const rootElement = globalThis.document.querySelector<HTMLElement>("#root");
if (rootElement === null) throw new Error("Web root element is missing");
const root = createRoot(rootElement);
const query = new globalThis.URLSearchParams(globalThis.location.search);

const renderTestRoute = async (reactRoot: Root): Promise<void> => {
  const [{ default: mapDocumentArtifact }, { createTestDecisionWorkflow }] =
    await Promise.all([
      import("./test-map-document-artifact.json"),
      import("./test-decision-workflow.js"),
    ]);
  const mapDocumentProjection = verifyMapDocumentArtifact(
    mapDocumentArtifact,
    "7c5178d2ddcb54e127ff3eb7b6afdae2567d1cd5e8a39c295dcd949b3a383f73",
  );
  const queryState = query.get("state");
  const viewState: UiShellViewState =
    queryState === "loading" ||
    queryState === "error" ||
    queryState === "partial"
      ? queryState
      : "ready";
  const decisionWorkflow = createTestDecisionWorkflow({
    failFirstSave: query.get("decisionScenario") === "adverse",
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
  reactRoot.render(
    <StrictMode>
      <UiShell
        model={model}
        state={viewState}
        mapDocuments={mapDocumentProjection}
        decisionWorkflow={decisionWorkflow}
      />
    </StrictMode>,
  );
};

const renderLoading = (reactRoot: Root): void => {
  reactRoot.render(
    <main className="am-bootstrap-state">
      <h1>African Mandate</h1>
      <p role="status">Verifying production artifacts and local campaign…</p>
    </main>,
  );
};

const renderProductionRoute = async (reactRoot: Root): Promise<void> => {
  renderLoading(reactRoot);
  try {
    const runtime = await createProductionRuntime();
    let latest = runtime.initialProjection;
    const trackedWorkflow: UiDecisionWorkflow = {
      initialProjection: latest,
      commit: async (prior, request) => {
        const outcome = await runtime.workflow.commit(prior, request);
        latest = outcome.projection;
        return outcome;
      },
      endMonth: async (prior, request) => {
        const outcome = await runtime.workflow.endMonth(prior, request);
        latest = outcome.projection;
        return outcome;
      },
    };
    const automation = globalThis as typeof globalThis & {
      render_game_to_text?: () => string;
      advanceTime?: (milliseconds: number) => void;
    };
    automation.render_game_to_text = () =>
      JSON.stringify({
        mode: "SIMULATED_PRODUCTION",
        campaignId: latest.campaign.campaignId,
        revision: latest.campaign.campaignRevision,
        turn: latest.campaign.currentTurn,
        decisionsRemaining: latest.campaign.decisionsRemaining,
        actions: latest.actionOptions.map(({ label, preview }) => ({
          label,
          available: preview.action.eligibility.available,
        })),
      });
    automation.advanceTime = () => undefined;
    globalThis.addEventListener("beforeunload", () => runtime.close(), {
      once: true,
    });
    const campaign = latest.campaign;
    const model = UiShellModelSchema.parse({
      schemaVersion: 1,
      contractVersion: "0.1.0-test.1",
      classification: "SIMULATED_PRODUCTION_UI_SHELL",
      campaignRevision: campaign.campaignRevision,
      currentTurn: campaign.currentTurn,
      maxTurns: campaign.maxTurns,
      currentDate: campaign.currentDate,
      decisionsRemaining: campaign.decisionsRemaining,
      decisionsPerTurn: campaign.decisionsPerTurn,
      campaignStatus: campaign.campaignStatus,
      saveState: {
        localStatus: "saved",
        syncStatus: "unavailable",
        detail: runtime.recoveredFromSnapshot
          ? "Recovered and restored the last valid local snapshot. Cloud sync is unavailable."
          : "The verified campaign is durable on this device. Cloud sync is unavailable.",
      },
      attentionItems: [
        {
          id: "ui_attention_simulation_disclosure",
          severity: "info",
          title:
            "All institutional positions, procedures, balances, and outcomes are fictional simulation design",
          destinationId: "campaign-workspace",
        },
      ],
    });
    reactRoot.render(
      <StrictMode>
        <UiShell
          model={model}
          mapDocuments={runtime.mapDocuments}
          decisionWorkflow={trackedWorkflow}
        />
      </StrictMode>,
    );
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown startup failure";
    reactRoot.render(
      <main className="am-bootstrap-state" role="alert">
        <h1>Campaign unavailable</h1>
        <p>The production artifacts or local snapshot could not be verified.</p>
        <p>{detail}</p>
        <button type="button" onClick={() => globalThis.location.reload()}>
          Retry
        </button>
      </main>,
    );
  }
};

void (query.get("testRoute") === "1"
  ? renderTestRoute(root)
  : renderProductionRoute(root));
