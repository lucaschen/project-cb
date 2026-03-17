import { z } from "zod";

import { conditionStatementSchema } from "~shared/db/schemas/conditionStatement";

import {
  decisionConditionSchema,
  decisionNodeSchema,
  stepNodeSchema,
} from "../common";

export const builderNodeCoordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type BuilderNodeCoordinatesType = z.infer<
  typeof builderNodeCoordinatesSchema
>;

export const builderStepInputSchema = stepNodeSchema
  .omit({
    coordinates: true,
    elements: true,
  })
  .extend({
    coordinates: builderNodeCoordinatesSchema,
  });

export type BuilderStepInputType = z.infer<typeof builderStepInputSchema>;

export const builderDecisionConditionInputSchema = decisionConditionSchema.omit(
  {
    order: true,
  },
);

export type BuilderDecisionConditionInputType = z.infer<
  typeof builderDecisionConditionInputSchema
>;

export const builderDecisionNodeInputSchema = decisionNodeSchema
  .omit({
    conditions: true,
    coordinates: true,
  })
  .extend({
    conditions: z.array(builderDecisionConditionInputSchema),
    coordinates: builderNodeCoordinatesSchema,
  });

export type BuilderDecisionNodeInputType = z.infer<
  typeof builderDecisionNodeInputSchema
>;
