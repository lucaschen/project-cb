import { z } from "zod";

import { conditionStatementSchema } from "~shared/db/schemas/conditionStatement";

export const builderNodeCoordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type BuilderNodeCoordinatesType = z.infer<
  typeof builderNodeCoordinatesSchema
>;

export const builderStepInputSchema = z
  .object({
    coordinates: builderNodeCoordinatesSchema,
    name: z.string().min(1),
    nextNodeId: z.string().uuid().nullable(),
    nodeId: z.string().uuid(),
  })
  .strict();

export type BuilderStepInputType = z.infer<typeof builderStepInputSchema>;

export const builderDecisionConditionInputSchema = z
  .object({
    id: z.string().uuid(),
    statement: conditionStatementSchema,
    toNodeId: z.string().uuid(),
  })
  .strict();

export type BuilderDecisionConditionInputType = z.infer<
  typeof builderDecisionConditionInputSchema
>;

export const builderDecisionNodeInputSchema = z
  .object({
    conditions: z.array(builderDecisionConditionInputSchema),
    coordinates: builderNodeCoordinatesSchema,
    fallbackNextNodeId: z.string().uuid(),
    name: z.string().min(1),
    nodeId: z.string().uuid(),
  })
  .strict();

export type BuilderDecisionNodeInputType = z.infer<
  typeof builderDecisionNodeInputSchema
>;
