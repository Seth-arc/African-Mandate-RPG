import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { CampaignProjection } from "@african-mandate/application";
import { createHeadlessInitialState } from "@african-mandate/headless";
import { buildPlayerKnowledgeProjection } from "@african-mandate/simulation";
import {
  UiShell,
  UiShellModelSchema,
  createUiShellModel,
} from "@african-mandate/ui";

const projection = (): CampaignProjection => {
  const state = createHeadlessInitialState();
  return {
    schemaVersion: 1,
    projectionType: "campaign",
    campaignId: state.meta.campaignId,
    campaignRevision: state.meta.revision,
    currentTurn: state.meta.currentTurn,
    maxTurns: state.meta.maxTurns,
    currentDate: state.meta.currentDate,
    decisionsRemaining: state.meta.decisionsRemaining,
    decisionsPerTurn: state.meta.decisionsPerTurn,
    campaignStatus: state.meta.status,
    playerKnowledge: buildPlayerKnowledgeProjection(state),
  };
};

const model = () =>
  createUiShellModel({
    projection: projection(),
    saveState: {
      localStatus: "saved",
      syncStatus: "unavailable",
      detail: "Saved locally. Cloud sync is unavailable.",
    },
    attentionItems: [
      {
        id: "ui_attention_test_review",
        severity: "warning",
        title: "Review incomplete reporting",
        destinationId: "campaign-workspace",
      },
    ],
  });

describe("Prompt 21 accessible UI shell", () => {
  it("derives campaign status only from the accepted campaign projection", () => {
    const result = model();
    const source = projection();
    expect(result.currentTurn).toBe(source.currentTurn);
    expect(result.currentDate).toBe(source.currentDate);
    expect(result.decisionsRemaining).toBe(source.decisionsRemaining);
    expect(result.campaignRevision).toBe(source.campaignRevision);
    expect(result.classification).toBe("TEST_ONLY_UI_SHELL");
  });

  it("renders semantic navigation, status, attention, and explained disabled control", () => {
    const html = renderToStaticMarkup(<UiShell model={model()} />);
    expect(html).toContain("Skip to campaign workspace");
    expect(html).toContain('aria-label="Campaign navigation"');
    expect(html).toContain('aria-label="Campaign status"');
    expect(html).toContain("Needs your attention");
    expect(html).toContain('aria-describedby="end-month-reason"');
    expect(html).toContain("Simulated · Test-only interface");
  });

  it.each([
    ["loading", "Loading campaign view"],
    ["error", "Campaign view could not load"],
    ["partial", "Partial campaign view"],
  ] as const)("renders the %s state explicitly", (state, expected) => {
    const html = renderToStaticMarkup(
      <UiShell model={model()} state={state} />,
    );
    expect(html).toContain(expected);
  });

  it("does not render the five unapproved headline indicators", () => {
    const html = renderToStaticMarkup(
      <UiShell model={model()} />,
    ).toLowerCase();
    for (const prohibited of [
      "stability",
      "insurgency",
      "civilian support",
      "global legitimacy",
      "regional synergy",
    ]) {
      expect(html).not.toContain(prohibited);
    }
  });

  it("rejects duplicate attention references", () => {
    const valid = model();
    expect(() =>
      UiShellModelSchema.parse({
        ...valid,
        attentionItems: [valid.attentionItems[0], valid.attentionItems[0]],
      }),
    ).toThrow(/Duplicate attention item id/u);
  });
});
