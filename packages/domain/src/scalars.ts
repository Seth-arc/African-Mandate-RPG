import { z } from "zod";

export const ScoreSchema = z.number().int().min(0).max(100).brand<"Score">();
export const SignedScoreSchema = z
  .number()
  .int()
  .min(-100)
  .max(100)
  .brand<"SignedScore">();
export const ProbabilitySchema = z
  .number()
  .finite()
  .min(0)
  .max(1)
  .brand<"Probability">();

export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u)
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year ?? 0, (month ?? 0) - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day
    );
  }, "Expected a real calendar date in YYYY-MM-DD form")
  .brand<"IsoDate">();

export const NonEmptyStringSchema = z.string().trim().min(1);
export const NonNegativeIntegerSchema = z.number().int().min(0);
export const PositiveIntegerSchema = z.number().int().positive();

export const MoneyAmountSchema = z
  .object({
    amount: z.number().finite(),
    currency: NonEmptyStringSchema,
  })
  .strict();

export type Score = z.infer<typeof ScoreSchema>;
export type SignedScore = z.infer<typeof SignedScoreSchema>;
export type Probability = z.infer<typeof ProbabilitySchema>;
export type IsoDate = z.infer<typeof IsoDateSchema>;
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;
