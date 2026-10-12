import {
  DECISION_WORKFLOW_CONTRACT_VERSION,
  DECISION_WORKFLOW_SCHEMA_VERSION,
  DecisionJournalEntrySchema,
  DecisionWorkflowCoordinator,
  DecisionWorkspaceProjectionSchema,
  type DecisionWorkspaceProjection,
} from "@african-mandate/application";
import {
  AtomicEndTurnResultSchema,
  AtomicStrategicCommandResultSchema,
} from "@african-mandate/domain";
import type { UiDecisionWorkflow } from "@african-mandate/ui";

const versions = {
  gameSchemaVersion: 1,
  simulationModelVersion: "0.1.0-test.1",
  baselineVersion: "test-only-baseline-v1",
  scenarioVersion: "test-only-four-month-v1",
  contentVersion: "0.1.0-test.1",
  balanceProfileVersion: "test-only-balance-v1",
  methodologyVersion: "unavailable-test-only-v1",
} as const;

const months = [
  {
    turn: 1,
    date: "2025-10-01",
    actions: [
      ["action_m01_task_access_verification", "Task access verification"],
      ["action_m01_consult_au_commission", "Consult the AU Commission"],
      ["action_m01_adopt_access_assessment", "Adopt the access assessment"],
    ],
  },
  {
    turn: 2,
    date: "2025-11-01",
    actions: [
      ["action_m02_consult_civic_channel", "Consult the civic channel"],
      ["action_m02_consult_aes_liaison", "Consult the AES liaison"],
      ["action_m02_open_access_case", "Respond to the access case"],
      ["action_m02_consult_ocha", "Consult the humanitarian office"],
    ],
  },
  {
    turn: 3,
    date: "2025-12-01",
    actions: [
      ["action_m03_negotiate_monitoring_terms", "Negotiate monitoring terms"],
      ["action_m03_open_civilian_case", "Open the civilian access case"],
      ["action_m03_open_corridor_case", "Open the corridor case"],
    ],
  },
  {
    turn: 4,
    date: "2026-01-01",
    actions: [
      ["action_m04_revise_assessment", "Revise the access assessment"],
      ["action_m04_revise_case_scope", "Revise the case scope"],
    ],
  },
] as const;

type ScriptState = {
  revision: number;
  turn: number;
  date: string;
  remaining: number;
  usedActionIds: string[];
  journal: DecisionWorkspaceProjection["journal"];
  ledger: DecisionWorkspaceProjection["resolutionLedger"];
};

const emptyKnowledge = (revision: number) => ({
  campaignRevision: revision,
  knowledge: {
    evidence: {},
    reports: {},
    intelligenceGaps: {},
    collectionTasks: {},
    redLineKnowledge: {},
    positionKnowledge: {},
    knownCommitmentIds: [],
    knownDisputeIds: [],
    relationshipKnowledge: {},
  },
  contradictions: [],
});

const hashForRevision = (revision: number) =>
  revision.toString(16).padStart(64, "0");

const commandId = (turn: number, actionId: string) =>
  `ui-script-turn-${String(turn)}-${actionId}`;

const buildWorkspace = (state: ScriptState): DecisionWorkspaceProjection => {
  const month = months.find(({ turn }) => turn === state.turn);
  const mandatoryPending =
    state.turn === 2 &&
    state.remaining === 1 &&
    !state.usedActionIds.includes("action_m02_open_access_case");
  const actionOptions = (month?.actions ?? [])
    .filter(([actionId]) => !state.usedActionIds.includes(actionId))
    .map(([actionId, label]) => {
      const reservedOptional =
        mandatoryPending && actionId === "action_m02_consult_ocha";
      const available = state.remaining > 0 && !reservedOptional;
      return {
        optionId: `option-${actionId}`,
        label,
        request: {
          contractVersion: "1.1.0",
          command: {
            commandId: commandId(state.turn, actionId),
            commandType: "strategic_action",
            campaignId: "campaign_test_decision_ui",
            submittedTurn: state.turn,
            payload: { actionId, targets: [], terms: [] },
          },
          expectedRevision: state.revision,
          expectedVersions: versions,
          ...(actionId === "action_m02_open_access_case" && mandatoryPending
            ? { mandatoryResponseAttentionItemId: "attention_access_response" }
            : {}),
        },
        preview: {
          schemaVersion: 1,
          projectionType: "action_preview",
          campaignId: "campaign_test_decision_ui",
          campaignRevision: state.revision,
          action: {
            actionId,
            commandType: "strategic_action",
            decisionSlotCost: 1,
            eligibility: {
              ruleResult: available ? "true" : "false",
              available,
              reasonCode: available ? "ELIGIBLE" : "KNOWN_REQUIREMENT_FAILED",
            },
            preview: {
              actionId,
              knownCosts: [
                {
                  costType: "secretariat_capacity",
                  amount: 1,
                  certainty: "known",
                },
              ],
              likelyInstitutionalReactions: [],
              knownRisks: [],
              intelligenceGaps: ["gap_access_condition"],
              implementationDependencies: [
                "A recorded follow-up is required after commitment.",
              ],
              confidence: 50,
            },
          },
        },
      };
    });
  const sliceComplete = month === undefined;
  return DecisionWorkspaceProjectionSchema.parse({
    schemaVersion: DECISION_WORKFLOW_SCHEMA_VERSION,
    contractVersion: DECISION_WORKFLOW_CONTRACT_VERSION,
    classification: "TEST_ONLY_DECISION_WORKSPACE",
    campaign: {
      schemaVersion: 1,
      projectionType: "campaign",
      campaignId: "campaign_test_decision_ui",
      campaignRevision: state.revision,
      currentTurn: state.turn,
      maxTurns: 20,
      currentDate: state.date,
      decisionsRemaining: state.remaining,
      decisionsPerTurn: 3,
      campaignStatus: "active",
      playerKnowledge: emptyKnowledge(state.revision),
    },
    actionOptions,
    journal: state.journal,
    resolutionLedger: state.ledger,
    endMonth: {
      available: !mandatoryPending && !sliceComplete,
      ...(!mandatoryPending && !sliceComplete
        ? {}
        : {
            reason: mandatoryPending
              ? "A known mandatory response must use the final decision slot before month end."
              : "The four-month TEST_ONLY interface slice is complete.",
          }),
      request: {
        contractVersion: "1.1.0",
        command: {
          commandId: `ui-script-end-month-${String(state.turn)}`,
          commandType: "end_turn",
          campaignId: "campaign_test_decision_ui",
          submittedTurn: state.turn,
          payload: {},
        },
        expectedRevision: state.revision,
        expectedVersions: versions,
      },
    },
  });
};

const ledgerCategories = [
  "implementation",
  "institutions",
  "regional_conditions",
  "intelligence",
  "watch",
] as const;

/** Fixed TEST_ONLY projection script. It does not resolve domain effects. */
export const createTestDecisionWorkflow = (options: {
  readonly failFirstSave: boolean;
}): UiDecisionWorkflow => {
  let state: ScriptState = {
    revision: 0,
    turn: 1,
    date: months[0].date,
    remaining: 3,
    usedActionIds: [],
    journal: [],
    ledger: [],
  };
  let failNextSave = options.failFirstSave;

  const coordinator = new DecisionWorkflowCoordinator({
    commands: {
      dispatch: async (request) => {
        if (failNextSave) {
          failNextSave = false;
          throw new Error("TEST_ONLY_INJECTED_LOCAL_SAVE_FAILURE");
        }
        const workspace = buildWorkspace(state);
        const option = workspace.actionOptions.find(
          ({ request: candidate }) =>
            candidate.command.commandId === request.command.commandId,
        );
        if (
          option === undefined ||
          !option.preview.action.eligibility.available
        ) {
          return AtomicStrategicCommandResultSchema.parse({
            status: "rejected" as const,
            idempotent: false as const,
            commandId: request.command.commandId,
            reasonCode: "KNOWN_REQUIREMENT_FAILED" as const,
            campaignRevision: state.revision,
            authoritativeStateHash: hashForRevision(state.revision),
          });
        }
        const actionId = request.command.payload.actionId;
        const nextRevision = state.revision + 1;
        const sequenceWithinTurn = 4 - state.remaining;
        const decisionId = `decision_ui_${String(nextRevision)}`;
        const journalEntry = DecisionJournalEntrySchema.parse({
          entryId: `journal-ui-${String(nextRevision)}`,
          commandId: request.command.commandId,
          decisionId,
          campaignRevision: nextRevision,
          turn: state.turn,
          sequenceWithinTurn,
          actionId,
          actionLabel: option.label,
          outcomeSummary:
            "The decision was durably recorded. Only player-known effects are shown.",
          committedOn: state.date,
        });
        state = {
          ...state,
          revision: nextRevision,
          remaining: state.remaining - 1,
          usedActionIds: [...state.usedActionIds, actionId],
          journal: [...state.journal, journalEntry],
        };
        return AtomicStrategicCommandResultSchema.parse({
          status: "committed" as const,
          idempotent: false as const,
          commandId: request.command.commandId,
          decisionId,
          decisionSlotCost: 1 as const,
          campaignRevision: nextRevision,
          authoritativeStateHash: hashForRevision(nextRevision),
        });
      },
    },
    turns: {
      endTurn: async (request) => {
        const workspace = buildWorkspace(state);
        if (!workspace.endMonth.available) {
          return AtomicEndTurnResultSchema.parse({
            status: "rejected" as const,
            idempotent: false as const,
            commandId: request.command.commandId,
            reasonCode: "BLOCKING_ATTENTION_REQUIRES_DECISION" as const,
            campaignRevision: state.revision,
            authoritativeStateHash: hashForRevision(state.revision),
          });
        }
        const resolvedTurn = state.turn;
        const nextRevision = state.revision + 1;
        const nextMonth = months.find(({ turn }) => turn === resolvedTurn + 1);
        const nextDate = nextMonth?.date ?? "2026-02-01";
        const entries = ledgerCategories.map((category, index) => ({
          entryId: `ledger-ui-${String(resolvedTurn)}-${category}`,
          commandId: request.command.commandId,
          campaignRevision: nextRevision,
          resolvedTurn,
          sequence: state.ledger.length + index + 1,
          category,
          summary: `SIMULATED TEST_ONLY ${category.replaceAll("_", " ")} outcome recorded for month ${String(resolvedTurn)}.`,
        }));
        state = {
          ...state,
          revision: nextRevision,
          turn: resolvedTurn + 1,
          date: nextDate,
          remaining: 3,
          usedActionIds: [],
          ledger: [...state.ledger, ...entries],
        };
        return AtomicEndTurnResultSchema.parse({
          status: "committed" as const,
          idempotent: false as const,
          commandId: request.command.commandId,
          resolvedTurn,
          currentTurn: state.turn,
          currentDate: state.date,
          finalTurn: false,
          campaignRevision: nextRevision,
          authoritativeStateHash: hashForRevision(nextRevision),
          resolverTrace: [],
        });
      },
    },
    projections: {
      load: async (_campaignId, expectedRevision) => {
        if (state.revision !== expectedRevision) {
          throw new Error("TEST_ONLY_SCRIPT_REVISION_MISMATCH");
        }
        return buildWorkspace(state);
      },
    },
  });

  const initialProjection = buildWorkspace(state);
  return {
    initialProjection,
    commit: (prior, request) => coordinator.commit(prior, request),
    endMonth: (prior, request) => coordinator.endMonth(prior, request),
  };
};
