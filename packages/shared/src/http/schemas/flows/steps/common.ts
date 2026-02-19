import { z } from "zod";

import { NodeType } from "~shared/types/enums";

export const stepPayload = z.object({
  flowId: z.string(),
  name: z.string(),
  nextNodeId: z.string().or(z.null()),
  nodeId: z.string(),
  type: z.literal(NodeType.STEP),
});

export type StepPayload = z.infer<typeof stepPayload>;
