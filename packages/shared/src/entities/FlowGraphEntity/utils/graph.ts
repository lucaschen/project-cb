import type { XYPosition } from "@xyflow/react";

import type { ComparisonStatement } from "~shared/db/schemas/conditionStatement";
import { ComparisonOperation, NodeType } from "~shared/types/enums";

import type {
  GraphDecisionFallbackEdge,
  GraphDecisionNode,
  GraphStepEdge,
  GraphStepNode,
} from "../types/flowGraph";

export const DECISION_FALLBACK_SOURCE_HANDLE_ID = "decision-fallback";

export const DEFAULT_DECISION_RULE_STATEMENT: ComparisonStatement = {
  leftValue: "",
  operator: ComparisonOperation.EQ,
  rightValue: "",
  type: "comparison",
};

const FALLBACK_NODE_X = 120;
const FALLBACK_NODE_Y = 120;
const FALLBACK_NODE_X_GAP = 280;

export const getFallbackPosition = (index: number) => ({
  x: FALLBACK_NODE_X + index * FALLBACK_NODE_X_GAP,
  y: FALLBACK_NODE_Y,
});

export const getDecisionConditionIdFromSourceHandle = (
  sourceHandle: string | null | undefined,
) => {
  if (!sourceHandle?.startsWith("decision-rule:")) {
    return null;
  }

  return sourceHandle.slice("decision-rule:".length) || null;
};

export const getDecisionRuleSourceHandleId = (conditionId: string) =>
  `decision-rule:${conditionId}`;

export const createGraphStepNode = ({
  data,
  nodeId = crypto.randomUUID(),
  position,
}: {
  data?: Partial<GraphStepNode["data"]>;
  nodeId?: string;
  position: XYPosition;
}): GraphStepNode => ({
  data: {
    name: "Untitled step",
    type: NodeType.STEP,
    ...data,
  },
  id: nodeId,
  position,
  selectable: true,
  type: "step",
});

export const createGraphDecisionNode = ({
  data,
  nodeId = crypto.randomUUID(),
  position,
}: {
  data?: Partial<GraphDecisionNode["data"]>;
  nodeId?: string;
  position: XYPosition;
}): GraphDecisionNode => ({
  data: {
    name: "Untitled decision",
    rules: [],
    type: NodeType.DECISION,
    ...data,
  },
  id: nodeId,
  position,
  selectable: true,
  type: "decision",
});

export const createGraphStepEdge = ({
  sourceNodeId,
  targetNodeId,
}: {
  sourceNodeId: string;
  targetNodeId: string;
}): GraphStepEdge => ({
  data: {
    type: "step",
  },
  id: `default:${sourceNodeId}:${targetNodeId}`,
  source: sourceNodeId,
  target: targetNodeId,
  type: "builder",
});

export const createGraphDecisionFallbackEdge = ({
  sourceNodeId,
  targetNodeId,
}: {
  sourceNodeId: string;
  targetNodeId: string;
}): GraphDecisionFallbackEdge => ({
  data: {
    type: "fallback",
  },
  id: `fallback:${sourceNodeId}:${targetNodeId}`,
  source: sourceNodeId,
  sourceHandle: DECISION_FALLBACK_SOURCE_HANDLE_ID,
  target: targetNodeId,
  type: "builder",
});
