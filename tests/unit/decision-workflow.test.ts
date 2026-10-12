import { describe, expect, it, vi } from "vitest";

import {
  DecisionWorkflowCoordinator,
  DecisionWorkspaceProjectionSchema,
} from "@african-mandate/application";
import { createTestDecisionWorkflow } from "../../apps/web/src/test-decision-workflow.js";

describe("Prompt 23 decision workflow", () => {
  it("crosses one atomic command boundary and exposes the journal after completion", async () => {
    const script = createTestDecisionWorkflow({ failFirstSave: false });
    const prior = script.initialProjection;
    const option = prior.actionOptions[0]!;
    const scriptedOutcome = await script.commit(prior, option.request);
    const dispatch = vi.fn(async () => scriptedOutcome.result);
    const load = vi.fn(async () => scriptedOutcome.projection);
    const coordinator = new DecisionWorkflowCoordinator({
      commands: { dispatch },
      turns: {
        endTurn: vi.fn(async () => ({
          status: "rejected" as const,
          idempotent: false as const,
          reasonCode: "INVALID_REQUEST_SCHEMA" as const,
        })),
      },
      projections: { load },
    });

    const outcome = await coordinator.commit(prior, option.request);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(1);
    expect(outcome.projection.journal.at(-1)?.commandId).toBe(
      option.request.command.commandId,
    );
    expect(outcome.projection.campaign.campaignRevision).toBe(1);
  });

  it("does not refresh or mutate the prior projection after a save failure", async () => {
    const script = createTestDecisionWorkflow({ failFirstSave: false });
    const prior = script.initialProjection;
    const before = structuredClone(prior);
    const load = vi.fn(async () => prior);
    const coordinator = new DecisionWorkflowCoordinator({
      commands: {
        dispatch: vi.fn(async () => {
          throw new Error("injected durable write failure");
        }),
      },
      turns: {
        endTurn: vi.fn(async () => ({
          status: "rejected" as const,
          idempotent: false as const,
          reasonCode: "INVALID_REQUEST_SCHEMA" as const,
        })),
      },
      projections: { load },
    });

    await expect(
      coordinator.commit(prior, prior.actionOptions[0]!.request),
    ).rejects.toThrow(/durable write failure/u);
    expect(load).not.toHaveBeenCalled();
    expect(prior).toEqual(before);
  });

  it("rejects journal reordering and hidden preview additions", async () => {
    const script = createTestDecisionWorkflow({ failFirstSave: false });
    const first = await script.commit(
      script.initialProjection,
      script.initialProjection.actionOptions[0]!.request,
    );
    const second = await script.commit(
      first.projection,
      first.projection.actionOptions[0]!.request,
    );
    expect(() =>
      DecisionWorkspaceProjectionSchema.parse({
        ...second.projection,
        journal: [...second.projection.journal].reverse(),
      }),
    ).toThrow(/append-only chronological history/u);
    expect(() =>
      DecisionWorkspaceProjectionSchema.parse({
        ...second.projection,
        actionOptions: second.projection.actionOptions.map((option, index) =>
          index === 0
            ? {
                ...option,
                preview: {
                  ...option.preview,
                  action: {
                    ...option.preview.action,
                    preview: {
                      ...option.preview.action.preview,
                      hiddenSuccessProbability: 0.9,
                    },
                  },
                },
              }
            : option,
        ),
      }),
    ).toThrow();
  });

  it("reserves the last slot for a known mandatory response", async () => {
    const workflow = createTestDecisionWorkflow({ failFirstSave: false });
    let projection = workflow.initialProjection;
    for (let index = 0; index < 3; index += 1) {
      const outcome = await workflow.commit(
        projection,
        projection.actionOptions.find(
          ({ preview }) => preview.action.eligibility.available,
        )!.request,
      );
      projection = outcome.projection;
    }
    projection = (
      await workflow.endMonth(projection, projection.endMonth.request)
    ).projection;
    for (const label of [
      "Consult the civic channel",
      "Consult the AES liaison",
    ]) {
      const option = projection.actionOptions.find(
        (candidate) => candidate.label === label,
      )!;
      projection = (await workflow.commit(projection, option.request))
        .projection;
    }

    expect(projection.campaign.decisionsRemaining).toBe(1);
    expect(projection.endMonth.available).toBe(false);
    expect(projection.endMonth.reason).toMatch(/mandatory response/u);
    expect(
      projection.actionOptions.find(
        ({ label }) => label === "Consult the humanitarian office",
      )?.preview.action.eligibility.available,
    ).toBe(false);
    expect(
      projection.actionOptions.find(
        ({ label }) => label === "Respond to the access case",
      )?.preview.action.eligibility.available,
    ).toBe(true);
  });
});
