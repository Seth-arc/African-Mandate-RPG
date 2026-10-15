import {
  EVALUATION_DIMENSIONS,
  EvaluationDimensionResultSchema,
  FinalEvaluationSchema,
  ProductionEvaluationRequestSchema,
  SimulatedAuthorizationProgressSchema,
  SimulatedAuthorizationResultSchema,
  type EvaluationDimensionResult,
  type FinalEvaluation,
  type ProductionEvaluationRequest,
  type SimulatedAuthorizationProgress,
  type SimulatedAuthorizationResult,
} from "@african-mandate/domain";

import { roundHalfAwayFromZero } from "./determinism/primitives.js";

const clampScore = (value: number): number => Math.max(0, Math.min(100, value));

export const resolveSimulatedAuthorization = (
  input: SimulatedAuthorizationProgress,
): SimulatedAuthorizationResult => {
  const progress = SimulatedAuthorizationProgressSchema.parse(input);
  const expiredTurn = progress.requestedTurn + progress.procedure.expiryTurns;
  if (progress.currentTurn >= expiredTurn) {
    return SimulatedAuthorizationResultSchema.parse({
      status: "expired",
      expiredTurn,
    });
  }
  const completed = new Set(progress.completedSteps);
  const missingSteps = progress.procedure.requiredSteps.filter(
    (step) => !completed.has(step),
  );
  const earliestResolutionTurn =
    progress.requestedTurn + progress.procedure.leadTimeTurns;
  if (
    missingSteps.length > 0 ||
    progress.currentTurn < earliestResolutionTurn
  ) {
    return SimulatedAuthorizationResultSchema.parse({
      status: "pending",
      reasonCode: missingSteps.length > 0 ? "MISSING_STEPS" : "LEAD_TIME",
      missingSteps,
      earliestResolutionTurn,
    });
  }
  return SimulatedAuthorizationResultSchema.parse({
    status: "authorized",
    resolvedTurn: progress.currentTurn,
  });
};

const evaluateDimension = (
  values: readonly number[],
  harm: number,
  request: ProductionEvaluationRequest,
): EvaluationDimensionResult => {
  const startingScore = values[0]!;
  const endingScore = values.at(-1)!;
  const mean =
    values.reduce((total, value) => total + value, 0) / values.length;
  const criticalTurns = values.filter(
    (value) => value < request.profile.criticalThreshold,
  ).length;
  const criticalPenalty = Math.min(
    request.profile.criticalPenaltyCap,
    criticalTurns * request.profile.criticalPenaltyPerTurn,
  );
  const score = roundHalfAwayFromZero(
    clampScore(
      endingScore * request.profile.endingWeight +
        mean * request.profile.trajectoryMeanWeight -
        criticalPenalty -
        harm * request.profile.countervailingHarmWeight,
    ),
  );
  const delta = endingScore - startingScore;
  const trend =
    Math.abs(delta) <= request.profile.stableDelta
      ? "stable"
      : delta > 0
        ? "improving"
        : "deteriorating";
  return EvaluationDimensionResultSchema.parse({
    score,
    startingScore,
    endingScore,
    trend,
    criticalTurns,
    summaryCode: `SIMULATED_${trend.toUpperCase()}`,
  });
};

export const evaluateSimulatedCampaign = (
  input: ProductionEvaluationRequest,
): FinalEvaluation => {
  const request = ProductionEvaluationRequestSchema.parse(input);
  if (request.snapshots.length !== request.profile.requiredTurns) {
    throw new RangeError(
      `Expected ${request.profile.requiredTurns} evaluation snapshots`,
    );
  }
  request.snapshots.forEach((snapshot, index) => {
    if (snapshot.turn !== index + 1) {
      throw new RangeError(
        "Evaluation snapshots must contain consecutive turns",
      );
    }
  });
  const result = Object.fromEntries(
    EVALUATION_DIMENSIONS.map((dimension) => [
      dimension,
      evaluateDimension(
        request.snapshots.map((snapshot) => snapshot[dimension]),
        request.countervailingHarms[dimension],
        request,
      ),
    ]),
  );
  return FinalEvaluationSchema.parse({
    ...result,
    causalChains: request.causalChains,
  });
};
