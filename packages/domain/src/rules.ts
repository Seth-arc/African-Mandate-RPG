import { z } from "zod";

import { SubjectKindSchema, SubjectRefSchema } from "./references.js";
import { NonEmptyStringSchema, NonNegativeIntegerSchema } from "./scalars.js";

export const FACT_KEYS = [
  "zone.conflict_pressure",
  "zone.humanitarian_access",
  "territory.stability",
  "actor.capability.political",
  "relationship.trust",
  "relationship.credibility",
  "assessment.declared_confidence",
  "assessment.support_score",
  "mandate.coalition_support",
  "mandate.authorization_status",
  "player.political_capital",
  "player.secretariat_capacity",
] as const;

export const FactKeySchema = z.enum(FACT_KEYS);

export const RuleScopeSchema = z.enum([
  "simulation",
  "player_eligibility",
  "player_forecast",
  "narrative",
]);

export const FactValueTypeSchema = z.enum([
  "number",
  "string",
  "boolean",
  "string_array",
  "entity_ref",
]);

export const FactDefinitionSchema = z
  .object({
    key: FactKeySchema,
    valueType: FactValueTypeSchema,
    allowedScopes: z.array(RuleScopeSchema).min(1),
    subjectKinds: z.array(SubjectKindSchema),
    resolverId: NonEmptyStringSchema,
  })
  .strict()
  .superRefine((definition, ctx) => {
    if (
      new Set(definition.allowedScopes).size !== definition.allowedScopes.length
    ) {
      ctx.addIssue({
        code: "custom",
        message: "allowedScopes must not contain duplicates",
        path: ["allowedScopes"],
      });
    }
    if (
      new Set(definition.subjectKinds).size !== definition.subjectKinds.length
    ) {
      ctx.addIssue({
        code: "custom",
        message: "subjectKinds must not contain duplicates",
        path: ["subjectKinds"],
      });
    }
  });

export const SubjectSelectorSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("literal"), subject: SubjectRefSchema }).strict(),
  z
    .object({
      kind: z.literal("command_target"),
      targetIndex: NonNegativeIntegerSchema,
    })
    .strict(),
  z
    .object({ kind: z.literal("mandate_case"), source: z.literal("current") })
    .strict(),
  z
    .object({
      kind: z.literal("assessment_subject"),
      source: z.literal("current"),
    })
    .strict(),
]);

export const FactQuerySchema = z
  .object({
    fact: FactKeySchema,
    subject: SubjectSelectorSchema.optional(),
  })
  .strict();

export const ResolvedFactQuerySchema = z
  .object({
    fact: FactKeySchema,
    subject: SubjectRefSchema.optional(),
  })
  .strict();

export const FactValueSchema = z.union([
  z.number().finite(),
  z.string(),
  z.boolean(),
  z.array(z.string()),
  SubjectRefSchema,
]);

export const FactResolutionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("known"), value: FactValueSchema }).strict(),
  z
    .object({
      kind: z.literal("unknown"),
      reasonCode: NonEmptyStringSchema,
    })
    .strict(),
]);

export const KnownFactObservationSchema = z
  .object({
    query: ResolvedFactQuerySchema,
    resolution: FactResolutionSchema,
  })
  .strict();

export const RuleResultSchema = z.enum(["true", "false", "unknown"]);

type SubjectSelectorValue = z.infer<typeof SubjectSelectorSchema>;

type RuleExpressionValue =
  | {
      kind: "predicate";
      query: {
        fact: z.infer<typeof FactKeySchema>;
        subject?: SubjectSelectorValue | undefined;
      };
      operator:
        | "eq"
        | "neq"
        | "gt"
        | "gte"
        | "lt"
        | "lte"
        | "contains"
        | "not_contains"
        | "exists"
        | "not_exists";
      value?: string | number | boolean | undefined;
      unknownPolicy?: "propagate" | "treat_true" | "treat_false" | undefined;
    }
  | { kind: "all"; rules: RuleExpressionValue[] }
  | { kind: "any"; rules: RuleExpressionValue[] }
  | { kind: "not"; rule: RuleExpressionValue };

const RulePredicateSchema = z
  .object({
    kind: z.literal("predicate"),
    query: FactQuerySchema,
    operator: z.enum([
      "eq",
      "neq",
      "gt",
      "gte",
      "lt",
      "lte",
      "contains",
      "not_contains",
      "exists",
      "not_exists",
    ]),
    value: z.union([z.string(), z.number().finite(), z.boolean()]).optional(),
    unknownPolicy: z
      .enum(["propagate", "treat_true", "treat_false"])
      .optional(),
  })
  .strict()
  .superRefine((predicate, ctx) => {
    const isExistenceOperator =
      predicate.operator === "exists" || predicate.operator === "not_exists";
    if (isExistenceOperator && predicate.value !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: `${predicate.operator} must not declare a comparison value`,
        path: ["value"],
      });
    }
    if (!isExistenceOperator && predicate.value === undefined) {
      ctx.addIssue({
        code: "custom",
        message: `${predicate.operator} requires a comparison value`,
        path: ["value"],
      });
    }
  });

export const RuleExpressionSchema: z.ZodType<RuleExpressionValue> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    RulePredicateSchema,
    z
      .object({ kind: z.literal("all"), rules: z.array(RuleExpressionSchema) })
      .strict(),
    z
      .object({ kind: z.literal("any"), rules: z.array(RuleExpressionSchema) })
      .strict(),
    z.object({ kind: z.literal("not"), rule: RuleExpressionSchema }).strict(),
  ]),
);

export type FactKey = z.infer<typeof FactKeySchema>;
export type RuleScope = z.infer<typeof RuleScopeSchema>;
export type FactValueType = z.infer<typeof FactValueTypeSchema>;
export type FactDefinition = z.infer<typeof FactDefinitionSchema>;
export type SubjectSelector = z.infer<typeof SubjectSelectorSchema>;
export type FactQuery = z.infer<typeof FactQuerySchema>;
export type ResolvedFactQuery = z.infer<typeof ResolvedFactQuerySchema>;
export type FactValue = z.infer<typeof FactValueSchema>;
export type FactResolution = z.infer<typeof FactResolutionSchema>;
export type KnownFactObservation = z.infer<typeof KnownFactObservationSchema>;
export type RuleResult = z.infer<typeof RuleResultSchema>;
export type RuleExpression = z.infer<typeof RuleExpressionSchema>;
