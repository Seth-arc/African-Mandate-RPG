import { z } from "zod";

export const EDITORIAL_QA_SCHEMA_VERSION = 1 as const;
export const EDITORIAL_QA_CONTRACT_VERSION = "0.1.0-test.1" as const;

const Sha256Schema = z.string().regex(/^[0-9a-f]{64}$/u);
const NonEmptyStringSchema = z.string().trim().min(1);

export const EditorialIssueSchema = z
  .object({
    ruleId: NonEmptyStringSchema,
    sourceId: NonEmptyStringSchema,
    excerpt: NonEmptyStringSchema,
  })
  .strict();

export const EditorialAuditResultSchema = z
  .object({
    schemaVersion: z.literal(EDITORIAL_QA_SCHEMA_VERSION),
    contractVersion: z.literal(EDITORIAL_QA_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_EDITORIAL_QA"),
    failures: z.array(EditorialIssueSchema),
    reviews: z.array(EditorialIssueSchema),
  })
  .strict();

export const TextContainerMeasurementSchema = z
  .object({
    route: NonEmptyStringSchema,
    viewportWidth: z.number().int().positive(),
    viewportHeight: z.number().int().positive(),
    textScalePercent: z.literal(200),
    containerCount: z.number().int().nonnegative(),
    horizontalOverflowCount: z.number().int().nonnegative(),
    clippedTextCount: z.number().int().nonnegative(),
    screenshotPath: NonEmptyStringSchema,
    screenshotSha256: Sha256Schema.optional(),
  })
  .strict();

const ApprovalStatusSchema = z.enum(["PENDING", "BLOCKED", "APPROVED"]);

export const HumanApprovalEntrySchema = z
  .object({
    approvalId: z.string().regex(/^AM-EDITORIAL-[0-9]{3}$/u),
    area: z.enum([
      "sahel_regional_language",
      "institutional_legal_protocol",
      "publication_and_licensing",
      "novice_cold_read",
      "assistive_technology_lab",
    ]),
    status: ApprovalStatusSchema,
    ownerRole: NonEmptyStringSchema,
    scope: NonEmptyStringSchema,
    missingEvidence: z.array(NonEmptyStringSchema),
    reviewer: z
      .object({
        name: NonEmptyStringSchema,
        role: NonEmptyStringSchema,
        reviewedAt: z.string().datetime({ offset: true }),
        findings: NonEmptyStringSchema,
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((entry, context) => {
    if (entry.status === "APPROVED" && entry.reviewer === undefined) {
      context.addIssue({
        code: "custom",
        message: "APPROVED requires a named, dated reviewer record",
        path: ["reviewer"],
      });
    }
    if (entry.status === "APPROVED" && entry.missingEvidence.length > 0) {
      context.addIssue({
        code: "custom",
        message: "APPROVED cannot retain missing evidence",
        path: ["missingEvidence"],
      });
    }
    if (entry.status !== "APPROVED" && entry.reviewer !== undefined) {
      context.addIssue({
        code: "custom",
        message: "Pending or blocked entries cannot imply completed review",
        path: ["reviewer"],
      });
    }
  });

export const HumanApprovalRegisterSchema = z
  .object({
    schemaVersion: z.literal(EDITORIAL_QA_SCHEMA_VERSION),
    contractVersion: z.literal(EDITORIAL_QA_CONTRACT_VERSION),
    classification: z.literal("HUMAN_APPROVAL_REGISTER"),
    taskId: z.literal("AM-PB2-24"),
    entries: z.array(HumanApprovalEntrySchema).length(5),
  })
  .strict()
  .superRefine((register, context) => {
    const ids = new Set<string>();
    const areas = new Set<string>();
    register.entries.forEach((entry, index) => {
      if (ids.has(entry.approvalId)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate approval ID: ${entry.approvalId}`,
          path: ["entries", index, "approvalId"],
        });
      }
      if (areas.has(entry.area)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate approval area: ${entry.area}`,
          path: ["entries", index, "area"],
        });
      }
      ids.add(entry.approvalId);
      areas.add(entry.area);
    });
  });

export interface EditorialSourceText {
  readonly sourceId: string;
  readonly text: string;
}

interface AuditPattern {
  readonly ruleId: string;
  readonly pattern: RegExp;
}

const failurePatterns: readonly AuditPattern[] = [
  {
    ruleId: "COPY_GENERIC_ERROR",
    pattern: /\b(?:Something went wrong|Oops|Uh-oh)\b/giu,
  },
  {
    ruleId: "COPY_PLACEHOLDER",
    pattern: /\b(?:lorem ipsum|Acme|John Doe|Jane Doe)\b/giu,
  },
  { ruleId: "COPY_DARK_CONTINENT", pattern: /\bDark Continent\b/giu },
  {
    ruleId: "COPY_PRESENT_PERFECT_STATUS",
    pattern: /\bhas been (?:saved|committed|sent|updated|removed)\b/giu,
  },
  {
    ruleId: "COPY_SENSORY_INSTRUCTION",
    pattern:
      /(?:click|press|tap|select) the (?:red|green|blue|yellow|round|square)|the (?:left|right|top|bottom) (?:button|panel|menu)/giu,
  },
  {
    ruleId: "COPY_UNNAMED_AUTHORITY",
    pattern:
      /\b(?:observers|analysts|experts|sources) (?:say|said|warn|warned|note|noted|believe)\b/giu,
  },
  {
    ruleId: "COPY_REGIONAL_CLICHE",
    pattern:
      /\b(?:Africa rising|arc of instability|ungoverned space|failed state|hotbed|flashpoint|volatile region|troubled region|warlord)\b/giu,
  },
  {
    ruleId: "COPY_GAMIFICATION",
    pattern:
      /\b(?:level up|unlock(?:ed)?|achievement|score|bonus|combo|power-?up|game over|you win|you lose|victory|defeat|mission complete)\b/giu,
  },
];

const reviewPatterns: readonly AuditPattern[] = [
  { ruleId: "COPY_EM_DASH", pattern: /\u2014/gu },
  {
    ruleId: "COPY_MARKETING_LANGUAGE",
    pattern:
      /\b(?:powerful|seamless|effortless|supercharge|transform|intelligent|next-generation|revolutionary|elevate|empower|leverage)\b/giu,
  },
  { ruleId: "COPY_EXCLAMATION", pattern: /!/gu },
  { ruleId: "COPY_REPLACEMENT_CHARACTER", pattern: /\uFFFD/gu },
];

const excerptFor = (text: string, index: number, length: number): string =>
  text
    .slice(Math.max(0, index - 32), Math.min(text.length, index + length + 32))
    .replaceAll(/\s+/gu, " ")
    .trim();

const collectIssues = (
  sources: readonly EditorialSourceText[],
  patterns: readonly AuditPattern[],
) =>
  sources.flatMap((source) =>
    patterns.flatMap(({ ruleId, pattern }) => {
      pattern.lastIndex = 0;
      return [...source.text.matchAll(pattern)].map((match) => ({
        ruleId,
        sourceId: source.sourceId,
        excerpt: excerptFor(
          source.text,
          match.index ?? 0,
          match[0]?.length ?? 1,
        ),
      }));
    }),
  );

export const auditEditorialCopy = (sources: readonly EditorialSourceText[]) =>
  EditorialAuditResultSchema.parse({
    schemaVersion: EDITORIAL_QA_SCHEMA_VERSION,
    contractVersion: EDITORIAL_QA_CONTRACT_VERSION,
    classification: "TEST_ONLY_EDITORIAL_QA",
    failures: collectIssues(sources, failurePatterns),
    reviews: collectIssues(sources, reviewPatterns),
  });

export const auditTokenReferences = (
  tokenSource: string,
  componentCss: string,
): readonly string[] => {
  const definitions = new Set(
    [...tokenSource.matchAll(/(--[a-z0-9-]+)\s*:/giu)].map(
      (match) => match[1]!,
    ),
  );
  return [
    ...new Set(
      [...componentCss.matchAll(/var\((--[a-z0-9-]+)\)/giu)]
        .map((match) => match[1]!)
        .filter((token) => !definitions.has(token)),
    ),
  ].sort();
};

export type EditorialIssue = z.infer<typeof EditorialIssueSchema>;
export type EditorialAuditResult = z.infer<typeof EditorialAuditResultSchema>;
export type TextContainerMeasurement = z.infer<
  typeof TextContainerMeasurementSchema
>;
export type HumanApprovalEntry = z.infer<typeof HumanApprovalEntrySchema>;
export type HumanApprovalRegister = z.infer<typeof HumanApprovalRegisterSchema>;
