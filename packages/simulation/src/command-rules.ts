import {
  ActionMenuEntrySchema,
  ActionDefinitionSchema,
  CommandPreparationResultSchema,
  DecisionPreviewSchema,
  FactDefinitionSchema,
  FactResolutionSchema,
  KnownCostProfileSchema,
  KnownFactObservationSchema,
  PostCommitHiddenResolutionRequestSchema,
  PostCommitHiddenResolutionResultSchema,
  RuleExpressionSchema,
  StrategicActionCommandSchema,
  type ActionDefinition,
  type ActionMenuEntry,
  type CampaignState,
  type CommandPreparationResult,
  type FactDefinition,
  type FactKey,
  type FactResolution,
  type FactValue,
  type JsonObject,
  type KnowledgeForecast,
  type KnownCostProfile,
  type PostCommitHiddenResolutionRequest,
  type PostCommitHiddenResolutionResult,
  type PreviewCost,
  type RuleExpression,
  type RuleResult,
  type RuleScope,
  type StrategicActionCommand,
  type SubjectRef,
} from "@african-mandate/domain";

export class RuleConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "RuleConfigurationError";
  }
}

export class FactRegistry {
  readonly #definitions = new Map<FactKey, FactDefinition>();

  public constructor(definitions: readonly unknown[]) {
    for (const input of definitions) {
      const definition = FactDefinitionSchema.parse(input);
      if (this.#definitions.has(definition.key)) {
        throw new RuleConfigurationError(
          `Duplicate fact definition: ${definition.key}`,
        );
      }
      this.#definitions.set(definition.key, definition);
    }
  }

  public get(key: FactKey): FactDefinition {
    const definition = this.#definitions.get(key);
    if (definition === undefined) {
      throw new RuleConfigurationError(`Unregistered fact: ${key}`);
    }
    return definition;
  }
}

const subjectIdentity = (subject: SubjectRef): string => {
  switch (subject.kind) {
    case "territory":
      return `${subject.kind}:${subject.territoryId}`;
    case "zone":
      return `${subject.kind}:${subject.zoneId}`;
    case "asset":
      return `${subject.kind}:${subject.assetId}`;
    case "corridor":
      return `${subject.kind}:${subject.corridorId}`;
    case "actor":
      return `${subject.kind}:${subject.actorId}`;
    case "institution":
      return `${subject.kind}:${subject.institutionId}`;
    case "assessment":
      return `${subject.kind}:${subject.assessmentId}`;
    case "mandate_case":
      return `${subject.kind}:${subject.mandateCaseId}`;
    case "world_event":
      return `${subject.kind}:${subject.worldEventId}`;
  }
};

export const factObservationKey = (
  fact: FactKey,
  subject?: SubjectRef,
): string =>
  `${fact}\0${subject === undefined ? "" : subjectIdentity(subject)}`;

export interface FactSource {
  resolve(definition: FactDefinition, subject?: SubjectRef): FactResolution;
}

export class KnownFactSource implements FactSource {
  readonly #observations = new Map<string, FactResolution>();

  public constructor(observations: readonly unknown[]) {
    for (const input of observations) {
      const observation = KnownFactObservationSchema.parse(input);
      const key = factObservationKey(
        observation.query.fact,
        observation.query.subject,
      );
      if (this.#observations.has(key)) {
        throw new RuleConfigurationError(`Duplicate fact observation: ${key}`);
      }
      this.#observations.set(key, observation.resolution);
    }
  }

  public resolve(
    definition: FactDefinition,
    subject?: SubjectRef,
  ): FactResolution {
    return (
      this.#observations.get(factObservationKey(definition.key, subject)) ?? {
        kind: "unknown",
        reasonCode: "FACT_NOT_OBSERVED",
      }
    );
  }
}

export interface RuleEvaluationContext {
  readonly scope: RuleScope;
  readonly factSource: FactSource;
  readonly commandTargets?: readonly SubjectRef[];
  readonly currentMandateCase?: Extract<SubjectRef, { kind: "mandate_case" }>;
  readonly currentAssessmentSubject?: SubjectRef;
}

const resolveSubject = (
  expression: Extract<RuleExpression, { kind: "predicate" }>,
  context: RuleEvaluationContext,
): SubjectRef | undefined => {
  const selector = expression.query.subject;
  if (selector === undefined) return undefined;
  switch (selector.kind) {
    case "literal":
      return selector.subject;
    case "command_target": {
      const subject = context.commandTargets?.[selector.targetIndex];
      if (subject === undefined) {
        throw new RuleConfigurationError(
          `Unable to resolve command target ${selector.targetIndex}`,
        );
      }
      return subject;
    }
    case "mandate_case":
      if (context.currentMandateCase === undefined) {
        throw new RuleConfigurationError(
          "Unable to resolve current mandate case",
        );
      }
      return context.currentMandateCase;
    case "assessment_subject":
      if (context.currentAssessmentSubject === undefined) {
        throw new RuleConfigurationError(
          "Unable to resolve current assessment subject",
        );
      }
      return context.currentAssessmentSubject;
  }
};

const factValueMatchesDefinition = (
  value: FactValue,
  definition: FactDefinition,
): boolean => {
  switch (definition.valueType) {
    case "number":
      return typeof value === "number";
    case "string":
      return typeof value === "string";
    case "boolean":
      return typeof value === "boolean";
    case "string_array":
      return (
        Array.isArray(value) && value.every((item) => typeof item === "string")
      );
    case "entity_ref":
      return typeof value === "object" && value !== null && "kind" in value;
  }
};

const compareKnownValue = (
  operator: Extract<RuleExpression, { kind: "predicate" }>["operator"],
  actual: FactValue,
  expected: string | number | boolean | undefined,
): RuleResult => {
  if (operator === "exists") return "true";
  if (operator === "not_exists") return "false";
  if (expected === undefined) {
    throw new RuleConfigurationError(`${operator} requires a comparison value`);
  }
  if (operator === "eq" || operator === "neq") {
    if (
      (typeof actual !== "string" &&
        typeof actual !== "number" &&
        typeof actual !== "boolean") ||
      typeof actual !== typeof expected
    ) {
      throw new RuleConfigurationError(
        `${operator} received incompatible values`,
      );
    }
    const equal = actual === expected;
    return operator === "eq"
      ? equal
        ? "true"
        : "false"
      : equal
        ? "false"
        : "true";
  }
  if (["gt", "gte", "lt", "lte"].includes(operator)) {
    if (typeof actual !== "number" || typeof expected !== "number") {
      throw new RuleConfigurationError(`${operator} requires numeric values`);
    }
    const result =
      operator === "gt"
        ? actual > expected
        : operator === "gte"
          ? actual >= expected
          : operator === "lt"
            ? actual < expected
            : actual <= expected;
    return result ? "true" : "false";
  }
  if (operator === "contains" || operator === "not_contains") {
    if (typeof expected !== "string") {
      throw new RuleConfigurationError(`${operator} requires a string value`);
    }
    const contains =
      typeof actual === "string"
        ? actual.includes(expected)
        : Array.isArray(actual)
          ? actual.includes(expected)
          : undefined;
    if (contains === undefined) {
      throw new RuleConfigurationError(
        `${operator} requires a string or string-array fact`,
      );
    }
    return operator === "contains"
      ? contains
        ? "true"
        : "false"
      : contains
        ? "false"
        : "true";
  }
  throw new RuleConfigurationError(`Unsupported operator: ${operator}`);
};

const evaluateParsedRule = (
  expression: RuleExpression,
  registry: FactRegistry,
  context: RuleEvaluationContext,
): RuleResult => {
  if (expression.kind === "not") {
    const result = evaluateParsedRule(expression.rule, registry, context);
    return result === "unknown"
      ? "unknown"
      : result === "true"
        ? "false"
        : "true";
  }
  if (expression.kind === "all") {
    let sawUnknown = false;
    for (const rule of expression.rules) {
      const result = evaluateParsedRule(rule, registry, context);
      if (result === "false") return "false";
      if (result === "unknown") sawUnknown = true;
    }
    return sawUnknown ? "unknown" : "true";
  }
  if (expression.kind === "any") {
    let sawUnknown = false;
    for (const rule of expression.rules) {
      const result = evaluateParsedRule(rule, registry, context);
      if (result === "true") return "true";
      if (result === "unknown") sawUnknown = true;
    }
    return sawUnknown ? "unknown" : "false";
  }

  const definition = registry.get(expression.query.fact);
  if (!definition.allowedScopes.includes(context.scope)) {
    throw new RuleConfigurationError(
      `${definition.key} is not allowed in ${context.scope}`,
    );
  }
  const subject = resolveSubject(expression, context);
  if (definition.subjectKinds.length === 0 && subject !== undefined) {
    throw new RuleConfigurationError(
      `${definition.key} does not accept a subject`,
    );
  }
  if (
    definition.subjectKinds.length > 0 &&
    (subject === undefined || !definition.subjectKinds.includes(subject.kind))
  ) {
    throw new RuleConfigurationError(
      `${definition.key} has an invalid subject`,
    );
  }

  const resolution = FactResolutionSchema.parse(
    context.factSource.resolve(definition, subject),
  );
  if (resolution.kind === "unknown") {
    if (expression.unknownPolicy === "treat_true") return "true";
    if (expression.unknownPolicy === "treat_false") return "false";
    return "unknown";
  }
  if (!factValueMatchesDefinition(resolution.value, definition)) {
    throw new RuleConfigurationError(
      `${definition.key} resolver returned the wrong value type`,
    );
  }
  return compareKnownValue(
    expression.operator,
    resolution.value,
    expression.value,
  );
};

export const evaluateRule = (
  expression: unknown,
  registry: FactRegistry,
  context: RuleEvaluationContext,
): RuleResult =>
  evaluateParsedRule(RuleExpressionSchema.parse(expression), registry, context);

export interface KnowledgeSafeActionMenuInput {
  readonly actions: readonly ActionDefinition[];
  readonly factRegistry: FactRegistry;
  readonly factSource: KnownFactSource;
  readonly costProfiles: readonly KnownCostProfile[];
  readonly forecasts: Readonly<Record<string, KnowledgeForecast>>;
}

const costProfileMap = (
  profiles: readonly KnownCostProfile[],
): ReadonlyMap<string, KnownCostProfile> => {
  const result = new Map<string, KnownCostProfile>();
  for (const input of profiles) {
    const profile = KnownCostProfileSchema.parse(input);
    if (result.has(profile.knownCostProfileId)) {
      throw new RuleConfigurationError(
        `Duplicate known cost profile: ${profile.knownCostProfileId}`,
      );
    }
    result.set(profile.knownCostProfileId, profile);
  }
  return result;
};

const costsForAction = (
  action: ActionDefinition,
  profiles: ReadonlyMap<string, KnownCostProfile>,
): readonly PreviewCost[] => {
  if (action.knownCostProfileId === undefined) return [];
  const profile = profiles.get(action.knownCostProfileId);
  if (profile === undefined) {
    throw new RuleConfigurationError(
      `Missing known cost profile: ${action.knownCostProfileId}`,
    );
  }
  return profile.costs;
};

export const buildKnowledgeSafeActionMenu = (
  input: KnowledgeSafeActionMenuInput,
): readonly ActionMenuEntry[] => {
  const profiles = costProfileMap(input.costProfiles);
  const actions = input.actions.map((candidate) =>
    ActionDefinitionSchema.parse(candidate),
  );
  return actions
    .sort((left, right) => left.actionId.localeCompare(right.actionId))
    .map((action) => {
      const ruleResult = evaluateRule(
        action.eligibilityRule,
        input.factRegistry,
        {
          scope: "player_eligibility",
          factSource: input.factSource,
        },
      );
      const forecast = input.forecasts[action.actionId];
      if (forecast === undefined) {
        throw new RuleConfigurationError(
          `Missing knowledge forecast: ${action.actionId}`,
        );
      }
      return ActionMenuEntrySchema.parse({
        actionId: action.actionId,
        commandType: action.commandType,
        decisionSlotCost: action.decisionSlotCost,
        eligibility: {
          ruleResult,
          available: ruleResult === "true",
          reasonCode:
            ruleResult === "true"
              ? "ELIGIBLE"
              : ruleResult === "false"
                ? "KNOWN_REQUIREMENT_FAILED"
                : "INSUFFICIENT_KNOWN_INFORMATION",
        },
        preview: DecisionPreviewSchema.parse({
          ...forecast,
          actionId: action.actionId,
          knownCosts: costsForAction(action, profiles),
        }),
      });
    });
};

export type StructuralValidationResult =
  | { readonly status: "valid" }
  | { readonly status: "impossible"; readonly detailCode: string };

export type StructuralActionValidator = (input: {
  readonly action: ActionDefinition;
  readonly command: StrategicActionCommand;
  readonly player: CampaignState["player"];
}) => StructuralValidationResult;

export interface PrepareStrategicCommandInput {
  readonly command: unknown;
  readonly campaign: CampaignState;
  readonly actions: readonly ActionDefinition[];
  readonly factRegistry: FactRegistry;
  readonly factSource: KnownFactSource;
  readonly costProfiles: readonly KnownCostProfile[];
  readonly structuralValidators: Readonly<
    Record<string, StructuralActionValidator | undefined>
  >;
}

const targetSetIsValid = (
  action: ActionDefinition,
  targets: readonly SubjectRef[],
): boolean => {
  if (
    targets.length < action.targetSchema.minTargets ||
    targets.length > action.targetSchema.maxTargets ||
    targets.some(
      (target) => !action.targetSchema.allowedKinds.includes(target.kind),
    )
  ) {
    return false;
  }
  if (action.targetSchema.uniqueTargets === true) {
    const keys = targets.map(subjectIdentity);
    if (new Set(keys).size !== keys.length) return false;
  }
  return true;
};

const knownCostsAreAffordable = (
  costs: readonly PreviewCost[],
  player: CampaignState["player"],
): boolean =>
  costs.every((cost) => {
    if (cost.certainty !== "known") return true;
    if (cost.costType === "budget") {
      return (
        cost.money !== undefined &&
        cost.money.currency === player.materialResources.budget.currency &&
        cost.money.amount <= player.materialResources.budget.amount
      );
    }
    const available =
      cost.costType === "personnel"
        ? player.materialResources.personnel
        : cost.costType === "political_capital"
          ? player.institutionalCapacity.politicalCapital
          : cost.costType === "secretariat_capacity"
            ? player.institutionalCapacity.secretariatCapacity
            : player.institutionalCapacity.implementationCapacity;
    return cost.amount !== undefined && cost.amount <= available;
  });

const reject = (
  reasonCode: Extract<
    CommandPreparationResult,
    { status: "rejected" }
  >["reasonCode"],
  commandId?: StrategicActionCommand["commandId"],
  options: {
    readonly ruleResult?: RuleResult;
    readonly detailCode?: string;
  } = {},
): CommandPreparationResult =>
  CommandPreparationResultSchema.parse({
    status: "rejected",
    decisionSlotCost: 0,
    reasonCode,
    ...(commandId === undefined ? {} : { commandId }),
    ...(options.ruleResult === undefined
      ? {}
      : { ruleResult: options.ruleResult }),
    ...(options.detailCode === undefined
      ? {}
      : { detailCode: options.detailCode }),
  });

export const prepareStrategicCommand = (
  input: PrepareStrategicCommandInput,
): CommandPreparationResult => {
  const parsed = StrategicActionCommandSchema.safeParse(input.command);
  if (!parsed.success) return reject("INVALID_COMMAND_SCHEMA");
  const command = parsed.data;
  if (command.campaignId !== input.campaign.meta.campaignId) {
    return reject("CAMPAIGN_MISMATCH", command.commandId);
  }
  if (input.campaign.meta.status !== "active") {
    return reject("CAMPAIGN_NOT_ACTIVE", command.commandId);
  }
  if (command.submittedTurn !== input.campaign.meta.currentTurn) {
    return reject("TURN_MISMATCH", command.commandId);
  }
  if (input.campaign.processedCommandIds[command.commandId] === true) {
    return CommandPreparationResultSchema.parse({
      status: "duplicate",
      commandId: command.commandId,
      decisionSlotCost: 0,
    });
  }
  let actions: readonly ActionDefinition[];
  try {
    actions = input.actions.map((candidate) =>
      ActionDefinitionSchema.parse(candidate),
    );
  } catch {
    return reject("CONFIGURATION_ERROR", command.commandId, {
      detailCode: "ACTION_DEFINITION_INVALID",
    });
  }
  const action = actions.find(
    (candidate) => candidate.actionId === command.payload.actionId,
  );
  if (action === undefined) return reject("UNKNOWN_ACTION", command.commandId);
  if (action.commandType !== command.commandType) {
    return reject("COMMAND_TYPE_MISMATCH", command.commandId);
  }
  if (!targetSetIsValid(action, command.payload.targets)) {
    return reject("INVALID_TARGETS", command.commandId);
  }
  const structuralValidator = input.structuralValidators[action.actionId];
  if (structuralValidator === undefined) {
    return reject("CONFIGURATION_ERROR", command.commandId, {
      detailCode: "MISSING_STRUCTURAL_VALIDATOR",
    });
  }
  let structuralResult: StructuralValidationResult;
  try {
    structuralResult = structuralValidator({
      action,
      command,
      player: input.campaign.player,
    });
  } catch {
    return reject("CONFIGURATION_ERROR", command.commandId, {
      detailCode: "STRUCTURAL_VALIDATOR_FAILED",
    });
  }
  if (structuralResult.status === "impossible") {
    return reject("STRUCTURALLY_IMPOSSIBLE_TERM", command.commandId, {
      detailCode: structuralResult.detailCode,
    });
  }

  let ruleResult: RuleResult;
  try {
    ruleResult = evaluateRule(action.eligibilityRule, input.factRegistry, {
      scope: "player_eligibility",
      factSource: input.factSource,
      commandTargets: command.payload.targets,
    });
  } catch {
    return reject("CONFIGURATION_ERROR", command.commandId, {
      detailCode: "ELIGIBILITY_CONFIGURATION_INVALID",
    });
  }
  if (ruleResult !== "true") {
    return reject(
      ruleResult === "false"
        ? "KNOWN_REQUIREMENT_FAILED"
        : "INSUFFICIENT_KNOWN_INFORMATION",
      command.commandId,
      { ruleResult },
    );
  }
  if (action.decisionSlotCost > input.campaign.meta.decisionsRemaining) {
    return reject("INSUFFICIENT_DECISION_SLOTS", command.commandId);
  }

  let costs: readonly PreviewCost[];
  try {
    costs = costsForAction(action, costProfileMap(input.costProfiles));
  } catch {
    return reject("CONFIGURATION_ERROR", command.commandId, {
      detailCode: "KNOWN_COST_PROFILE_INVALID",
    });
  }
  if (!knownCostsAreAffordable(costs, input.campaign.player)) {
    return reject("KNOWN_COST_UNAFFORDABLE", command.commandId);
  }
  return CommandPreparationResultSchema.parse({
    status: "prepared",
    commandId: command.commandId,
    actionId: action.actionId,
    decisionSlotCost: action.decisionSlotCost,
  });
};

export type PostCommitHiddenResolver = (input: {
  readonly request: PostCommitHiddenResolutionRequest;
  readonly hiddenState: JsonObject;
}) => PostCommitHiddenResolutionResult;

export const resolvePostCommitHiddenOutcome = (
  requestInput: unknown,
  hiddenState: JsonObject,
  resolver: PostCommitHiddenResolver,
): PostCommitHiddenResolutionResult => {
  const request = PostCommitHiddenResolutionRequestSchema.parse(requestInput);
  return PostCommitHiddenResolutionResultSchema.parse(
    resolver({ request, hiddenState }),
  );
};
