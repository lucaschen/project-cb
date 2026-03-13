import { z } from "zod";

import { ElementPropertyTypes } from "~shared/types/enums";

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const stepElementPropertySchema = z
  .object({
    propertyId: z.string().min(1),
    value: jsonValueSchema,
  })
  .strict();

export type StepElementPropertyType = z.infer<typeof stepElementPropertySchema>;

export const hydratedStepElementPropertySchema = z
  .object({
    defaultValue: z.string(),
    propertyId: z.string().min(1),
    propertyName: z.string().min(1),
    propertyType: z.enum(ElementPropertyTypes),
    required: z.boolean(),
    value: z.string(),
  })
  .strict();

export type HydratedStepElementPropertyType = z.infer<
  typeof hydratedStepElementPropertySchema
>;

export const stepElementSchema = z
  .object({
    elementId: z.string().min(1),
    id: z.string().min(1),
    name: z.string().min(1),
    properties: z.array(stepElementPropertySchema),
  })
  .strict();

export type StepElementType = z.infer<typeof stepElementSchema>;

export const hydratedStepElementSchema = z
  .object({
    elementId: z.string().min(1),
    id: z.string().min(1),
    name: z.string().min(1),
    order: z.number().int().nonnegative(),
    properties: z.array(hydratedStepElementPropertySchema),
  })
  .strict();

export type HydratedStepElementType = z.infer<typeof hydratedStepElementSchema>;
