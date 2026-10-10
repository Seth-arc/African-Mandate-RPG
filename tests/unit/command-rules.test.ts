import { describe, expect, it } from "vitest";

import {
  ActionDefinitionSchema,
  ActionMenuEntrySchema,
  CampaignStateSchema,
  COMMAND_RULE_CONTRACT_VERSION,
  DecisionPreviewSchema,
  FactKeySchema,
  KnowledgeForecastSchema,
  KnownCostProfileSchema,
  PostCommitHiddenResolutionRequestSchema,
  StrategicActionCommandSchema,
} from "@african-mandate/domain";
import {
  FactRegistry,
  KnownFactSource,
  buildKnowledgeSafeActionMenu,
  evaluateRule,
  prepareStrategicCommand,
  resolvePostCommitHiddenOutcome,
  type PostCommitHiddenResolver,
} from "@african-mandate/simulation";

const factDefinitions = [
  {
    key: "player.political_capital",
    valueType: "number",
    allowedScopes: ["player_eligibility", "player_forecast"],
    subjectKinds: [],
    resolverId: "known_player_political_capital",
  },
] as const;

const knownFacts = (value: number | "unknown" = 5) =>
  new KnownFactSource([
    {
      query: { fact: "player.political_capital" },
      resolution:
        value === "unknown"
          ? { kind: "unknown", reasonCode: "NOT_OBSERVED" }
          : { kind: "known", value },
    },
  ]);

const action = ActionDefinitionSchema.parse({
  actionId: "action_test_consult",
  nameKey: "test.action.consult.name",
  descriptionKey: "test.action.consult.description",
  actionDomain: "diplomacy",
  commandType: "consult_actor",
  decisionSlotCost: 1,
  targetSchema: {
    allowedKinds: ["actor"],
    minTargets: 1,
    maxTargets: 1,
    uniqueTargets: true,
  },
  eligibilityRule: {
    kind: "predicate",
    query: { fact: "player.political_capital" },
    operator: "gte",
    value: 2,
  },
  mandateRequirement: "none",
  knownCostProfileId: "cost_test_consult",
  immediateEffectProfileIds: [],
  consequenceProfileIds: [],
  doctrineSignal: {},
  previewPolicyId: "preview_test_known_only",
});

const costProfile = KnownCostProfileSchema.parse({
  knownCostProfileId: "cost_test_consult",
  costs: [
    {
      costType: "political_capital",
      amount: 1,
      certainty: "known",
    },
  ],
});

const forecast = KnowledgeForecastSchema.parse({
  likelyInstitutionalReactions: [],
  knownRisks: [],
  intelligenceGaps: [],
  implementationDependencies: [],
  confidence: 50,
});

const campaign = CampaignStateSchema.parse({
  meta: {
    campaignId: "campaign_command_rules_test",
    scenarioId: "scenario_command_rules_test",
    campaignSeed: "command-rules-test-seed",
    difficultyProfileId: "difficulty_test",
    currentTurn: 1,
    maxTurns: 20,
    currentDate: "2025-10-01",
    decisionsRemaining: 3,
    decisionsPerTurn: 3,
    revision: 0,
    status: "active",
  },
  player: {
    representedInstitutionId: "institution_command_rules_test",
    materialResources: {
      budget: { amount: 10, currency: "TEST" },
      personnel: 5,
      logistics: 50,
    },
    institutionalCapacity: {
      mandateAuthority: 50,
      politicalCapital: 5,
      secretariatCapacity: 5,
      memberStateAlignment: 50,
      partnerConfidence: 50,
      implementationCapacity: 5,
      intelligenceConfidence: 50,
    },
  },
  world: {},
  institutions: {},
  actors: {},
  relationships: {},
  positions: {},
  memories: {},
  commitments: {},
  redLines: {},
  disputes: {},
  knowledge: {},
  assessments: {},
  mandateCases: {},
  implementations: {},
  worldEvents: {},
  situations: {},
  attention: { items: {} },
  scheduledConsequences: {},
  doctrine: {},
  evaluation: {},
  decisions: [],
  domainEvents: [],
  processedCommandIds: {},
  versions: {
    gameSchemaVersion: 1,
    simulationModelVersion: "test-only-v1",
    baselineVersion: "test-only-v1",
    scenarioVersion: "test-only-v1",
    contentVersion: "test-only-v1",
    balanceProfileVersion: "test-only-v1",
    methodologyVersion: "test-only-v1",
  },
});

const command = StrategicActionCommandSchema.parse({
  commandId: "command_test_consult_1",
  commandType: "consult_actor",
  campaignId: campaign.meta.campaignId,
  submittedTurn: 1,
  payload: {
    actionId: action.actionId,
    targets: [{ kind: "actor", actorId: "actor_command_rules_test" }],
    terms: [],
  },
});

const registry = () => new FactRegistry(factDefinitions);

const validStructuralValidators = {
  [action.actionId]: () => ({ status: "valid" as const }),
};

describe("typed fact rules", () => {
  it("pins the allowlist and rejects arbitrary object-path facts", () => {
    expect(FactKeySchema.safeParse("territory.stability").success).toBe(true);
    expect(
      FactKeySchema.safeParse("world.zones.mopti.conflictPressure").success,
    ).toBe(false);
  });

  it("preserves unknown as unknown instead of coercing false or zero", () => {
    const source = knownFacts("unknown");
    const result = evaluateRule(action.eligibilityRule, registry(), {
      scope: "player_eligibility",
      factSource: source,
    });
    expect(result).toBe("unknown");
    expect(result).not.toBe("false");
    expect(
      source.resolve(registry().get("player.political_capital"), undefined),
    ).toEqual({ kind: "unknown", reasonCode: "NOT_OBSERVED" });
  });

  it("uses tri-state composition without collapsing an unknown branch", () => {
    expect(
      evaluateRule(
        {
          kind: "all",
          rules: [
            action.eligibilityRule,
            {
              kind: "predicate",
              query: { fact: "player.political_capital" },
              operator: "gt",
              value: 0,
            },
          ],
        },
        registry(),
        {
          scope: "player_eligibility",
          factSource: knownFacts("unknown"),
        },
      ),
    ).toBe("unknown");
  });
});

describe("knowledge-safe action menu and preview", () => {
  it("is identical for the same known projection across two hidden states", () => {
    const hiddenStateA = { actorIntent: "accept" };
    const hiddenStateB = { actorIntent: "refuse" };
    expect(hiddenStateA).not.toEqual(hiddenStateB);

    const surface = (hiddenState: { readonly actorIntent: string }) => {
      expect(hiddenState.actorIntent).toBeTypeOf("string");
      return buildKnowledgeSafeActionMenu({
        actions: [action],
        factRegistry: registry(),
        factSource: knownFacts(),
        costProfiles: [costProfile],
        forecasts: { [action.actionId]: forecast },
      });
    };

    const first = surface(hiddenStateA);
    const second = surface(hiddenStateB);
    expect(first).toEqual(second);
    expect(ActionMenuEntrySchema.array().safeParse(first).success).toBe(true);
    expect(first[0]?.eligibility).toEqual({
      ruleResult: "true",
      available: true,
      reasonCode: "ELIGIBLE",
    });
    expect(first[0]?.preview.knownCosts).toEqual(costProfile.costs);
  });

  it("fails closed while retaining unknown in the menu contract", () => {
    const [entry] = buildKnowledgeSafeActionMenu({
      actions: [action],
      factRegistry: registry(),
      factSource: knownFacts("unknown"),
      costProfiles: [costProfile],
      forecasts: { [action.actionId]: forecast },
    });
    expect(entry?.eligibility).toEqual({
      ruleResult: "unknown",
      available: false,
      reasonCode: "INSUFFICIENT_KNOWN_INFORMATION",
    });
  });
});

describe("command preparation", () => {
  it("schema-validates command IDs, action payloads, and signed targets", () => {
    expect(StrategicActionCommandSchema.safeParse(command).success).toBe(true);
    expect(
      StrategicActionCommandSchema.safeParse({
        ...command,
        unexpected: true,
      }).success,
    ).toBe(false);
    expect(
      StrategicActionCommandSchema.safeParse({
        ...command,
        payload: {
          ...command.payload,
          targets: [{ kind: "actor", actorId: "not-an-actor-id" }],
        },
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid action without consuming a decision slot", () => {
    const before = structuredClone(campaign);
    const result = prepareStrategicCommand({
      command: {
        ...command,
        payload: { ...command.payload, actionId: "action_missing" },
      },
      campaign,
      actions: [action],
      factRegistry: registry(),
      factSource: knownFacts(),
      costProfiles: [costProfile],
      structuralValidators: validStructuralValidators,
    });
    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "UNKNOWN_ACTION",
      decisionSlotCost: 0,
    });
    expect(campaign).toEqual(before);
    expect(campaign.meta.decisionsRemaining).toBe(3);
  });

  it("classifies duplicate command IDs as a zero-cost idempotent result", () => {
    const withDuplicate = CampaignStateSchema.parse({
      ...structuredClone(campaign),
      processedCommandIds: { [command.commandId]: true },
    });
    const result = prepareStrategicCommand({
      command,
      campaign: withDuplicate,
      actions: [action],
      factRegistry: registry(),
      factSource: knownFacts(),
      costProfiles: [costProfile],
      structuralValidators: validStructuralValidators,
    });
    expect(result).toEqual({
      status: "duplicate",
      commandId: command.commandId,
      decisionSlotCost: 0,
    });
    expect(withDuplicate.meta.decisionsRemaining).toBe(3);
  });

  it("rejects a schema-valid but action-invalid target without slot use", () => {
    const invalidTargetSets = [
      [],
      [
        {
          kind: "territory" as const,
          territoryId: "territory_command_rules_test",
        },
      ],
    ];
    for (const targets of invalidTargetSets) {
      const result = prepareStrategicCommand({
        command: {
          ...command,
          payload: { ...command.payload, targets },
        },
        campaign,
        actions: [action],
        factRegistry: registry(),
        factSource: knownFacts(),
        costProfiles: [costProfile],
        structuralValidators: validStructuralValidators,
      });
      expect(result).toMatchObject({
        status: "rejected",
        reasonCode: "INVALID_TARGETS",
        decisionSlotCost: 0,
      });
    }
    expect(campaign.meta.decisionsRemaining).toBe(3);
  });

  it("rejects unknown eligibility without converting it to false", () => {
    const result = prepareStrategicCommand({
      command,
      campaign,
      actions: [action],
      factRegistry: registry(),
      factSource: knownFacts("unknown"),
      costProfiles: [costProfile],
      structuralValidators: validStructuralValidators,
    });
    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "INSUFFICIENT_KNOWN_INFORMATION",
      ruleResult: "unknown",
      decisionSlotCost: 0,
    });
    expect(
      prepareStrategicCommand({
        command,
        campaign,
        actions: [action],
        factRegistry: registry(),
        factSource: knownFacts(1),
        costProfiles: [costProfile],
        structuralValidators: validStructuralValidators,
      }),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "KNOWN_REQUIREMENT_FAILED",
      ruleResult: "false",
      decisionSlotCost: 0,
    });
  });

  it("rejects unavailable slots and unaffordable known costs explicitly", () => {
    const noSlots = CampaignStateSchema.parse({
      ...structuredClone(campaign),
      meta: { ...campaign.meta, decisionsRemaining: 0 },
    });
    expect(
      prepareStrategicCommand({
        command,
        campaign: noSlots,
        actions: [action],
        factRegistry: registry(),
        factSource: knownFacts(),
        costProfiles: [costProfile],
        structuralValidators: validStructuralValidators,
      }),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "INSUFFICIENT_DECISION_SLOTS",
      decisionSlotCost: 0,
    });

    const noPoliticalCapital = CampaignStateSchema.parse({
      ...structuredClone(campaign),
      player: {
        ...campaign.player,
        institutionalCapacity: {
          ...campaign.player.institutionalCapacity,
          politicalCapital: 0,
        },
      },
    });
    expect(
      prepareStrategicCommand({
        command,
        campaign: noPoliticalCapital,
        actions: [action],
        factRegistry: registry(),
        factSource: knownFacts(),
        costProfiles: [costProfile],
        structuralValidators: validStructuralValidators,
      }),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "KNOWN_COST_UNAFFORDABLE",
      decisionSlotCost: 0,
    });
  });

  it("refuses a structurally impossible term before eligibility or slot use", () => {
    const impossibleCommand = StrategicActionCommandSchema.parse({
      ...command,
      commandId: "command_test_impossible_term",
      payload: {
        ...command.payload,
        terms: [
          {
            kind: "resource_commitment",
            amount: 11,
            structuralMaximum: 10,
          },
        ],
      },
    });
    const result = prepareStrategicCommand({
      command: impossibleCommand,
      campaign,
      actions: [action],
      factRegistry: registry(),
      factSource: knownFacts("unknown"),
      costProfiles: [costProfile],
      structuralValidators: {
        [action.actionId]: ({ command: candidate }) => {
          const term = candidate.payload.terms[0];
          return typeof term?.["amount"] === "number" &&
            typeof term["structuralMaximum"] === "number" &&
            term["amount"] > term["structuralMaximum"]
            ? { status: "impossible", detailCode: "RESOURCE_OUT_OF_BOUNDS" }
            : { status: "valid" };
        },
      },
    });
    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "STRUCTURALLY_IMPOSSIBLE_TERM",
      decisionSlotCost: 0,
      detailCode: "RESOURCE_OUT_OF_BOUNDS",
    });
    expect(campaign.meta.decisionsRemaining).toBe(3);
  });

  it("prepares a valid known-affordable action without mutating state", () => {
    const before = structuredClone(campaign);
    expect(
      prepareStrategicCommand({
        command,
        campaign,
        actions: [action],
        factRegistry: registry(),
        factSource: knownFacts(),
        costProfiles: [costProfile],
        structuralValidators: validStructuralValidators,
      }),
    ).toEqual({
      status: "prepared",
      commandId: command.commandId,
      actionId: action.actionId,
      decisionSlotCost: 1,
    });
    expect(campaign).toEqual(before);
  });
});

describe("post-commit hidden resolution", () => {
  it("rejects precommit hidden resolution and permits it only with commit evidence", () => {
    const request = {
      contractVersion: COMMAND_RULE_CONTRACT_VERSION,
      phase: "postcommit",
      commandId: command.commandId,
      decisionId: "decision_command_rules_test",
      actionId: action.actionId,
      targets: command.payload.targets,
      resolutionKey: "decision_command_rules_test:hidden_outcome",
    } as const;
    expect(
      PostCommitHiddenResolutionRequestSchema.safeParse(request).success,
    ).toBe(true);
    expect(
      PostCommitHiddenResolutionRequestSchema.safeParse({
        ...request,
        phase: "precommit",
      }).success,
    ).toBe(false);

    const resolver: PostCommitHiddenResolver = ({
      request: committed,
      hiddenState,
    }) => ({
      contractVersion: COMMAND_RULE_CONTRACT_VERSION,
      commandId: committed.commandId,
      decisionId: committed.decisionId,
      resolutionCode:
        hiddenState["actorIntent"] === "accept" ? "ACCEPTED" : "REFUSED",
      payload: {},
    });

    expect(
      resolvePostCommitHiddenOutcome(
        request,
        { actorIntent: "accept" },
        resolver,
      ).resolutionCode,
    ).toBe("ACCEPTED");
    expect(
      resolvePostCommitHiddenOutcome(
        request,
        { actorIntent: "refuse" },
        resolver,
      ).resolutionCode,
    ).toBe("REFUSED");
  });

  it("schema-validates knowledge previews independently of hidden resolution", () => {
    expect(
      DecisionPreviewSchema.safeParse({
        ...forecast,
        actionId: action.actionId,
        knownCosts: costProfile.costs,
      }).success,
    ).toBe(true);
  });
});
