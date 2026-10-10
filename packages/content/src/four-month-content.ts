import {
  ActionIdSchema,
  ActorRuntimeStateSchema,
  AssessmentActionBindingSchema,
  AssessmentConfidenceBandProfileSchema,
  AssessmentMetadataProfileSchema,
  AuthoredAssessmentHypothesisSchema,
  CollectionTaskTemplateSchema,
  ConsultationActionBindingSchema,
  ConsultationPackageSchema,
  IntelligenceGapIdSchema,
  KnowledgeEffectProfileSchema,
  MandateActionBindingSchema,
  NonEmptyStringSchema,
  PlayerKnowledgeStateSchema,
  PositionStateSchema,
  RuleExpressionSchema,
  ScenarioBundleSchema,
  TestOnlyAuthorizationProcedureEntrySchema,
  TestOnlyConsultationLegalProfileSchema,
  TestOnlyConsultationResponseProfileSchema,
  TestOnlyMandateCaseTemplateSchema,
  TestOnlyScopeNegotiationTemplateSchema,
} from "@african-mandate/domain";
import { z } from "zod";

export const FOUR_MONTH_CONTENT_CONTRACT_VERSION = "1.0.0" as const;
export const FOUR_MONTH_CONTENT_VERSION = "0.1.0-test.1" as const;
export const FOUR_MONTH_CONTENT_CLASSIFICATION =
  "TEST_ONLY_COMPILED_FOUR_MONTH_CONTENT" as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const MonthSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const TestOnlyRuleDefinitionSchema = z
  .object({
    ruleId: NonEmptyStringSchema,
    ruleVersion: z.literal("test-only-rules-v1"),
    classification: z.literal("TEST_ONLY_KNOWLEDGE_RULE"),
    expression: RuleExpressionSchema,
  })
  .strict();

const ExecutableActionAuditSchema = z
  .object({
    actionId: ActionIdSchema,
    sourceMonth: MonthSchema,
    family: z.enum(["collection", "consultation", "assessment", "mandate"]),
    status: z.literal("executable_test_only"),
    ruleId: NonEmptyStringSchema,
  })
  .strict();

const BlockedActionAuditSchema = z
  .object({
    actionId: ActionIdSchema,
    sourceMonth: MonthSchema,
    family: z.enum(["consultation", "authorization", "strategic_response"]),
    status: z.literal("blocked_unimplemented_canonical_system"),
    blockerSystemId: NonEmptyStringSchema,
    blockerReasonCode: NonEmptyStringSchema,
  })
  .strict();

export const AuthoringActionAuditSchema = z.discriminatedUnion("status", [
  ExecutableActionAuditSchema,
  BlockedActionAuditSchema,
]);

export const GapAliasSchema = z
  .object({
    alias: IntelligenceGapIdSchema,
    canonicalId: IntelligenceGapIdSchema,
    reason: NonEmptyStringSchema,
  })
  .strict();

export const TestOnlySourceStreamSchema = z
  .object({
    sourceStreamId: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_SYNTHETIC_SOURCE_STREAM"),
    sourceActorId: NonEmptyStringSchema.optional(),
    supportedOutcomeKinds: z
      .array(
        z.enum([
          "useful",
          "partial",
          "contested",
          "inconclusive",
          "delayed",
          "failed",
          "accepted",
          "conditional",
          "rejected",
        ]),
      )
      .min(1),
    containsHistoricalObservations: z.literal(false),
    containsRealPersonClaims: z.literal(false),
  })
  .strict();

export const TestOnlyMessageTemplateSchema = z
  .object({
    messageId: NonEmptyStringSchema,
    month: MonthSchema,
    classification: z.literal("SIMULATED_TEST_ONLY_MESSAGE"),
    bodyTemplate: z.string().min(1).startsWith("SIMULATED"),
    sourceStreamIds: z.array(NonEmptyStringSchema),
    knowledgeRefIds: z.array(NonEmptyStringSchema),
    containsHistoricalObservation: z.literal(false),
  })
  .strict();

const ActionSlotSchema = z
  .object({
    slot: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    disposition: z.literal("action"),
    actionId: ActionIdSchema,
  })
  .strict();

const DeferredSlotSchema = z
  .object({
    slot: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    disposition: z.literal("unused_defer"),
    reasonCode: NonEmptyStringSchema,
  })
  .strict();

const BranchMonthSchema = z
  .object({
    month: MonthSchema,
    decisionSlots: z.tuple([
      z.discriminatedUnion("disposition", [
        ActionSlotSchema,
        DeferredSlotSchema,
      ]),
      z.discriminatedUnion("disposition", [
        ActionSlotSchema,
        DeferredSlotSchema,
      ]),
      z.discriminatedUnion("disposition", [
        ActionSlotSchema,
        DeferredSlotSchema,
      ]),
    ]),
  })
  .strict()
  .superRefine((value, ctx) => {
    value.decisionSlots.forEach((slot, index) => {
      if (slot.slot !== index + 1) {
        ctx.addIssue({
          code: "custom",
          path: ["decisionSlots", index, "slot"],
          message: "Branch decision slots must be ordered 1, 2, 3",
        });
      }
    });
  });

export const TestOnlyBranchSchema = z
  .object({
    branchId: z.enum(["A", "B", "C"]),
    strategy: z.enum(["collect_first", "consult_first", "defer_redirect"]),
    months: z.tuple([
      BranchMonthSchema,
      BranchMonthSchema,
      BranchMonthSchema,
      BranchMonthSchema,
    ]),
    expectedKnownStateCodes: z.array(NonEmptyStringSchema).min(1),
  })
  .strict()
  .superRefine((branch, ctx) => {
    branch.months.forEach((month, index) => {
      if (month.month !== index + 1) {
        ctx.addIssue({
          code: "custom",
          path: ["months", index, "month"],
          message: "Branch months must be ordered 1 through 4",
        });
      }
    });
  });

export const UnimplementedCanonicalSystemSchema = z
  .object({
    systemId: NonEmptyStringSchema,
    ownerRole: NonEmptyStringSchema,
    state: z.literal("BLOCKED"),
    consequence: NonEmptyStringSchema,
  })
  .strict();

const RuntimeContractsSchema = z
  .object({
    actors: z
      .object({
        runtimeInitializations: z.array(ActorRuntimeStateSchema),
        positionInitializations: z.array(PositionStateSchema),
      })
      .strict(),
    collection: z
      .object({
        effectProfiles: z.array(KnowledgeEffectProfileSchema),
        taskTemplates: z.array(CollectionTaskTemplateSchema),
      })
      .strict(),
    consultation: z
      .object({
        actionBindings: z.array(ConsultationActionBindingSchema),
        legalProfiles: z.array(TestOnlyConsultationLegalProfileSchema),
        responseProfiles: z.array(TestOnlyConsultationResponseProfileSchema),
        authoredPackages: z.array(
          z
            .object({
              actionId: ActionIdSchema,
              targetActorId: NonEmptyStringSchema,
              package: ConsultationPackageSchema,
            })
            .strict(),
        ),
      })
      .strict(),
    assessment: z
      .object({
        actionBindings: z.array(AssessmentActionBindingSchema),
        hypotheses: z.array(AuthoredAssessmentHypothesisSchema),
        confidenceProfile: AssessmentConfidenceBandProfileSchema,
        metadataProfile: AssessmentMetadataProfileSchema,
      })
      .strict(),
    mandate: z
      .object({
        actionBindings: z.array(MandateActionBindingSchema),
        caseTemplates: z.array(TestOnlyMandateCaseTemplateSchema),
        scopeNegotiations: z.array(TestOnlyScopeNegotiationTemplateSchema),
        authorizationProcedures: z.array(
          TestOnlyAuthorizationProcedureEntrySchema,
        ),
      })
      .strict(),
  })
  .strict();

export const FourMonthTestContentArtifactSchema = z
  .object({
    schemaVersion: z.literal(FOUR_MONTH_CONTENT_CONTRACT_VERSION),
    contentVersion: z.literal(FOUR_MONTH_CONTENT_VERSION),
    classification: z.literal(FOUR_MONTH_CONTENT_CLASSIFICATION),
    ownership: z
      .object({
        package: z.literal("@african-mandate/content"),
        definitionsOwner: z.literal("@african-mandate/domain"),
        executionOwner: z.literal("@african-mandate/simulation"),
        sourceCompilerOwner: z.literal("@african-mandate/data-pipeline"),
      })
      .strict(),
    sourcePins: z.record(NonEmptyStringSchema, Sha256Schema),
    historicalConflictCutoff: z.literal("2025-09-26"),
    simulationStart: z.literal("2025-10-01"),
    noncoveragePeriod: z
      .object({
        startDate: z.literal("2025-09-27"),
        endDate: z.literal("2025-09-30"),
        interpretation: z.literal("UNKNOWN_NOT_ZERO"),
      })
      .strict(),
    actorProfile: z
      .object({
        version: z.literal("test-only-actor-profile-v1"),
        classification: z.literal("TEST_ONLY_SYNTHETIC_ACTOR_VALUES"),
      })
      .strict(),
    ruleDefinitions: z.array(TestOnlyRuleDefinitionSchema).min(1),
    scenarioBundle: ScenarioBundleSchema,
    runtimeContracts: RuntimeContractsSchema,
    initialPlayerKnowledge: PlayerKnowledgeStateSchema,
    authoringActionAudit: z.array(AuthoringActionAuditSchema).length(18),
    gapAliases: z.array(GapAliasSchema),
    sourceStreams: z.array(TestOnlySourceStreamSchema).min(1),
    messages: z.array(TestOnlyMessageTemplateSchema).min(4),
    monthlyAvailability: z
      .array(
        z
          .object({
            month: MonthSchema,
            authoringActionIds: z.array(ActionIdSchema).min(3),
          })
          .strict(),
      )
      .length(4),
    branches: z.array(TestOnlyBranchSchema).length(3),
    unimplementedCanonicalSystems: z
      .array(UnimplementedCanonicalSystemSchema)
      .min(5),
    productionGate: z
      .object({
        publishable: z.literal(false),
        result: z.literal("REJECTED_TEST_ONLY"),
        blockerSystemIds: z.array(NonEmptyStringSchema).min(1),
      })
      .strict(),
  })
  .strict()
  .superRefine((artifact, ctx) => {
    const unique = (
      values: readonly string[],
      path: PropertyKey[],
      label: string,
    ) => {
      const seen = new Set<string>();
      values.forEach((value, index) => {
        if (seen.has(value)) {
          ctx.addIssue({
            code: "custom",
            path: [...path, index],
            message: `Duplicate ${label}: ${value}`,
          });
        }
        seen.add(value);
      });
    };

    unique(
      artifact.authoringActionAudit.map(({ actionId }) => actionId),
      ["authoringActionAudit"],
      "authoring action ID",
    );
    unique(
      artifact.ruleDefinitions.map(({ ruleId }) => ruleId),
      ["ruleDefinitions"],
      "rule ID",
    );
    unique(
      artifact.gapAliases.map(({ alias }) => alias),
      ["gapAliases"],
      "gap alias",
    );
    unique(
      artifact.sourceStreams.map(({ sourceStreamId }) => sourceStreamId),
      ["sourceStreams"],
      "source stream ID",
    );
    unique(
      artifact.messages.map(({ messageId }) => messageId),
      ["messages"],
      "message ID",
    );
    unique(
      artifact.unimplementedCanonicalSystems.map(({ systemId }) => systemId),
      ["unimplementedCanonicalSystems"],
      "unimplemented system ID",
    );

    const executable: Set<string> = new Set(
      artifact.authoringActionAudit
        .filter(({ status }) => status === "executable_test_only")
        .map(({ actionId }) => actionId),
    );
    const bundleActions: Set<string> = new Set(
      Object.keys(artifact.scenarioBundle.actionDefinitions),
    );
    for (const actionId of executable) {
      if (!bundleActions.has(actionId)) {
        ctx.addIssue({
          code: "custom",
          path: ["scenarioBundle", "actionDefinitions"],
          message: `Executable audited action is not compiled: ${actionId}`,
        });
      }
    }
    for (const actionId of bundleActions) {
      if (!executable.has(actionId)) {
        ctx.addIssue({
          code: "custom",
          path: ["scenarioBundle", "actionDefinitions", actionId],
          message: `Compiled action is not executable in the audit: ${actionId}`,
        });
      }
    }

    const auditedActions = new Map<
      string,
      (typeof artifact.authoringActionAudit)[number]
    >(artifact.authoringActionAudit.map((audit) => [audit.actionId, audit]));
    const monthlyActions = new Set<string>();
    artifact.monthlyAvailability.forEach((availability, monthIndex) => {
      if (availability.month !== monthIndex + 1) {
        ctx.addIssue({
          code: "custom",
          path: ["monthlyAvailability", monthIndex, "month"],
          message: "Monthly availability must be ordered 1 through 4",
        });
      }
      unique(
        availability.authoringActionIds,
        ["monthlyAvailability", monthIndex, "authoringActionIds"],
        "monthly action ID",
      );
      availability.authoringActionIds.forEach((actionId, actionIndex) => {
        const audit = auditedActions.get(actionId);
        if (audit === undefined || audit.sourceMonth !== availability.month) {
          ctx.addIssue({
            code: "custom",
            path: [
              "monthlyAvailability",
              monthIndex,
              "authoringActionIds",
              actionIndex,
            ],
            message: `Monthly action is missing or assigned to another source month: ${actionId}`,
          });
        }
        monthlyActions.add(actionId);
      });
    });
    if (monthlyActions.size !== artifact.authoringActionAudit.length) {
      ctx.addIssue({
        code: "custom",
        path: ["monthlyAvailability"],
        message: "Monthly availability must inventory all 18 authoring actions",
      });
    }

    const rules = new Map(
      artifact.ruleDefinitions.map((rule) => [rule.ruleId, rule.expression]),
    );
    artifact.authoringActionAudit.forEach((audit, index) => {
      if (audit.status !== "executable_test_only") return;
      const expression = rules.get(audit.ruleId);
      if (expression === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["authoringActionAudit", index, "ruleId"],
          message: `Unknown rule ID: ${audit.ruleId}`,
        });
      } else if (
        JSON.stringify(expression) !==
        JSON.stringify(
          artifact.scenarioBundle.actionDefinitions[audit.actionId]
            ?.eligibilityRule,
        )
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["scenarioBundle", "actionDefinitions", audit.actionId],
          message: `Compiled eligibility rule does not match ${audit.ruleId}`,
        });
      }
    });

    const streamIds = new Set(
      artifact.sourceStreams.map(({ sourceStreamId }) => sourceStreamId),
    );
    const actorIds: Set<string> = new Set(
      Object.keys(artifact.scenarioBundle.actorDefinitions),
    );
    artifact.sourceStreams.forEach((stream, index) => {
      if (
        stream.sourceActorId !== undefined &&
        !actorIds.has(stream.sourceActorId)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceStreams", index, "sourceActorId"],
          message: `Source stream actor is not compiled: ${stream.sourceActorId}`,
        });
      }
    });
    const knowledgeRefs = new Set([
      ...Object.keys(artifact.initialPlayerKnowledge.evidence),
      ...Object.keys(artifact.initialPlayerKnowledge.reports),
      ...Object.keys(artifact.initialPlayerKnowledge.intelligenceGaps),
    ]);
    artifact.messages.forEach((message, index) => {
      message.sourceStreamIds.forEach((sourceStreamId) => {
        if (!streamIds.has(sourceStreamId)) {
          ctx.addIssue({
            code: "custom",
            path: ["messages", index, "sourceStreamIds"],
            message: `Unknown source stream: ${sourceStreamId}`,
          });
        }
      });
      message.knowledgeRefIds.forEach((knowledgeRefId) => {
        if (!knowledgeRefs.has(knowledgeRefId)) {
          ctx.addIssue({
            code: "custom",
            path: ["messages", index, "knowledgeRefIds"],
            message: `Unknown player-knowledge reference: ${knowledgeRefId}`,
          });
        }
      });
    });

    const gapIds = new Set(
      Object.keys(artifact.initialPlayerKnowledge.intelligenceGaps),
    );
    artifact.gapAliases.forEach((alias, index) => {
      if (!gapIds.has(alias.canonicalId)) {
        ctx.addIssue({
          code: "custom",
          path: ["gapAliases", index, "canonicalId"],
          message: `Gap alias target is not in initial knowledge: ${alias.canonicalId}`,
        });
      }
    });

    const compiledEffects = new Set(
      Object.keys(artifact.scenarioBundle.effectProfiles),
    );
    const assertRuntimeBinding = (
      actionId: string,
      effectProfileId: string,
      path: PropertyKey[],
    ) => {
      const action = Object.values(
        artifact.scenarioBundle.actionDefinitions,
      ).find((candidate) => candidate.actionId === actionId);
      if (action === undefined || !executable.has(actionId)) {
        ctx.addIssue({
          code: "custom",
          path,
          message: `Runtime binding references non-executable action: ${actionId}`,
        });
      } else if (
        !action.immediateEffectProfileIds.some((id) => id === effectProfileId)
      ) {
        ctx.addIssue({
          code: "custom",
          path,
          message: `Runtime binding effect is not owned by action ${actionId}`,
        });
      }
      if (!compiledEffects.has(effectProfileId)) {
        ctx.addIssue({
          code: "custom",
          path,
          message: `Runtime binding references unknown effect: ${effectProfileId}`,
        });
      }
    };
    artifact.runtimeContracts.collection.effectProfiles.forEach(
      (profile, index) => {
        if (!compiledEffects.has(profile.effectProfileId)) {
          ctx.addIssue({
            code: "custom",
            path: ["runtimeContracts", "collection", "effectProfiles", index],
            message: `Collection profile is not in the scenario bundle: ${profile.effectProfileId}`,
          });
        }
      },
    );
    artifact.runtimeContracts.consultation.actionBindings.forEach(
      (binding, index) =>
        assertRuntimeBinding(binding.actionId, binding.effectProfileId, [
          "runtimeContracts",
          "consultation",
          "actionBindings",
          index,
        ]),
    );
    artifact.runtimeContracts.assessment.actionBindings.forEach(
      (binding, index) =>
        assertRuntimeBinding(binding.actionId, binding.effectProfileId, [
          "runtimeContracts",
          "assessment",
          "actionBindings",
          index,
        ]),
    );
    artifact.runtimeContracts.mandate.actionBindings.forEach((binding, index) =>
      assertRuntimeBinding(binding.actionId, binding.effectProfileId, [
        "runtimeContracts",
        "mandate",
        "actionBindings",
        index,
      ]),
    );
    const actorRuntimeIds: Set<string> = new Set(
      artifact.runtimeContracts.actors.runtimeInitializations.map(
        ({ actorId }) => actorId,
      ),
    );
    if (
      actorRuntimeIds.size !== actorIds.size ||
      ![...actorIds].every((actorId) => actorRuntimeIds.has(actorId))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["runtimeContracts", "actors", "runtimeInitializations"],
        message:
          "Every compiled actor requires exactly one runtime initialization",
      });
    }
    artifact.runtimeContracts.consultation.authoredPackages.forEach(
      (authoredPackage, index) => {
        if (!actorIds.has(authoredPackage.targetActorId)) {
          ctx.addIssue({
            code: "custom",
            path: [
              "runtimeContracts",
              "consultation",
              "authoredPackages",
              index,
              "targetActorId",
            ],
            message: `Consultation target actor is not compiled: ${authoredPackage.targetActorId}`,
          });
        }
      },
    );

    const blockedSystems = new Set(
      artifact.unimplementedCanonicalSystems.map(({ systemId }) => systemId),
    );
    artifact.authoringActionAudit.forEach((audit, index) => {
      if (
        audit.status === "blocked_unimplemented_canonical_system" &&
        !blockedSystems.has(audit.blockerSystemId)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["authoringActionAudit", index, "blockerSystemId"],
          message: `Blocked action references unknown system: ${audit.blockerSystemId}`,
        });
      }
    });
    artifact.productionGate.blockerSystemIds.forEach((systemId, index) => {
      if (!blockedSystems.has(systemId)) {
        ctx.addIssue({
          code: "custom",
          path: ["productionGate", "blockerSystemIds", index],
          message: `Production gate references unknown system: ${systemId}`,
        });
      }
    });

    const branches: Set<string> = new Set(
      artifact.branches.map(({ branchId }) => branchId),
    );
    if (!["A", "B", "C"].every((branch) => branches.has(branch))) {
      ctx.addIssue({
        code: "custom",
        path: ["branches"],
        message: "Branch inventory must contain A, B, and C",
      });
    }
    artifact.branches.forEach((branch, branchIndex) => {
      branch.months.forEach((month, monthIndex) => {
        month.decisionSlots.forEach((slot, slotIndex) => {
          if (slot.disposition === "action" && !executable.has(slot.actionId)) {
            ctx.addIssue({
              code: "custom",
              path: [
                "branches",
                branchIndex,
                "months",
                monthIndex,
                "decisionSlots",
                slotIndex,
                "actionId",
              ],
              message: `Branch references non-executable action: ${slot.actionId}`,
            });
          }
        });
      });
    });
  });

export type FourMonthTestContentArtifact = z.infer<
  typeof FourMonthTestContentArtifactSchema
>;

export class TestOnlyContentPublicationError extends Error {
  public constructor(contentVersion: string) {
    super(
      `TEST_ONLY four-month content ${contentVersion} cannot pass the production publish gate`,
    );
    this.name = "TestOnlyContentPublicationError";
  }
}

export const assertFourMonthContentPublishable = (
  artifact: FourMonthTestContentArtifact,
): never => {
  throw new TestOnlyContentPublicationError(artifact.contentVersion);
};
