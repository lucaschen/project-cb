import { z } from "zod";

import { NodeType } from "~shared/types/enums";

export const decisionNodePayload = z.object({
  fallbackNextNodeId: z.string(),
  flowId: z.string(),
  name: z.string(),
  nodeId: z.string(),
  type: z.literal(NodeType.DECISION),
});

export type DecisionNodePayload = z.infer<typeof decisionNodePayload>;
