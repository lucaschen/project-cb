import { z } from "zod";

import { stepCoordinatesSchema, stepSummarySchema } from "./common";

export const saveStepsParams = z.object({
  flowId: z.string().min(1),
});

export type SaveStepsParams = z.infer<typeof saveStepsParams>;

export const saveStepsInput = z
  .object({
    steps: z.array(
      z
        .object({
          coordinates: stepCoordinatesSchema,
          name: z.string().min(1),
          nextNodeId: z.string().uuid().nullable(),
          nodeId: z.string().uuid(),
        })
        .strict(),
    ),
  })
  .strict();

export type SaveStepsInput = z.infer<typeof saveStepsInput>;

export const saveStepsOutput = z.array(stepSummarySchema);

export type SaveStepsOutput = z.infer<typeof saveStepsOutput>;
