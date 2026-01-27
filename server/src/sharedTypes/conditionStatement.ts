import { z } from "zod";

import { ComparisonOperation } from "../../../packages/shared/src/types/enums";

export type ConditionStatement = ComparisonStatement; // Define the structure of a condition as needed

const stepPropertyValueSelectorSchema = z.object({
  type: z.literal("stepElementValue"),
  stepElementId: z.string(),
});

const randomNumberGeneratorSchema = z.object({
  type: z.literal("randomNumber"),
  min: z.number(),
  max: z.number(),
});

export const comparisonStatementSchema = z.object({
  type: z.literal("comparison"),
  operator: z.custom<ComparisonOperation>(),
  leftValue: z
    .string()
    .or(z.number())
    .or(stepPropertyValueSelectorSchema)
    .or(randomNumberGeneratorSchema),
  rightValue: z.string().or(z.number()).or(stepPropertyValueSelectorSchema),
});

export type ComparisonStatement = z.infer<typeof comparisonStatementSchema>;
