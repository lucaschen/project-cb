import { z } from "zod";

import { NodeType } from "~shared/types/enums";

export const stepCoordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type StepCoordinatesType = z.infer<typeof stepCoordinatesSchema>;

export const stepSummarySchema = z.object({
  coordinates: stepCoordinatesSchema,
  flowId: z.string(),
  name: z.string(),
  nextNodeId: z.string().or(z.null()),
  nodeId: z.string(),
  type: z.literal(NodeType.STEP),
});

export type StepSummaryType = z.infer<typeof stepSummarySchema>;
