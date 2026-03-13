import { z } from "zod";

import { flowSchema } from "./common";

export const updateFlowMetadataParams = z.object({
  flowId: z.string().min(1),
});

export type UpdateFlowMetadataParams = z.infer<
  typeof updateFlowMetadataParams
>;

export const updateFlowMetadataInput = z
  .object({
    description: z.string().nullable().optional(),
    name: z.string().min(1).optional(),
  })
  .strict()
  .refine(
    (value) => value.name !== undefined || value.description !== undefined,
    {
      message: "At least one metadata field must be provided.",
    },
  );

export type UpdateFlowMetadataInput = z.infer<typeof updateFlowMetadataInput>;

export const updateFlowMetadataOutput = flowSchema;

export type UpdateFlowMetadataOutput = z.infer<typeof updateFlowMetadataOutput>;
