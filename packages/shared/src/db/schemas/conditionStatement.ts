import { z } from "zod";

import { ComparisonOperation } from "~shared/types/enums";

const stepElementValueSelectorSchema = z.object({
  stepElementId: z.string().min(1),
  type: z.literal("stepElementValue"),
});

const randomNumberGeneratorSchema = z.object({
  max: z.number(),
  min: z.number(),
  type: z.literal("randomNumber"),
});

export const comparisonStatementSchema = z.object({
  leftValue: z
    .string()
    .or(z.number())
    .or(stepElementValueSelectorSchema)
    .or(randomNumberGeneratorSchema),
  operator: z.enum(ComparisonOperation),
  rightValue: z.string().or(z.number()).or(stepElementValueSelectorSchema),
  type: z.literal("comparison"),
});

export type ComparisonStatement = z.infer<typeof comparisonStatementSchema>;

export const conditionStatementSchema = comparisonStatementSchema;

export type ConditionStatement = z.infer<typeof conditionStatementSchema>;
