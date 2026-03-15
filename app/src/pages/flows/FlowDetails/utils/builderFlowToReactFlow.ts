import type { ComparisonStatement } from "@packages/shared/db/schemas/conditionStatement";
import FlowBuilderEntity from "@packages/shared/entities/FlowBuilderEntity/FlowBuilderEntity";
import type {
  FlowGraph,
  FlowGraphEdge,
  FlowGraphNode,
  GraphDecisionFallbackEdge,
  GraphDecisionNode,
  GraphDecisionRuleEdge,
  GraphStepEdge,
  GraphStepNode,
} from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import {
  DECISION_FALLBACK_SOURCE_HANDLE_ID,
} from "@packages/shared/entities/FlowGraphEntity/utils/graph";
import type {
  DecisionConditionType,
  FlowWithNodesType,
} from "@packages/shared/http/schemas/flows/common";

export const isGraphStepNode = (node: FlowGraphNode): node is GraphStepNode => {
  return node.type === "step";
};

export const isGraphDecisionNode = (
  node: FlowGraphNode,
): node is GraphDecisionNode => {
  return node.type === "decision";
};

export const isDefaultEdge = (edge: FlowGraphEdge): edge is GraphStepEdge => {
  return edge.data.type === "step";
};

export const isDecisionFallbackEdge = (
  edge: FlowGraphEdge,
): edge is GraphDecisionFallbackEdge => {
  return edge.data.type === "fallback";
};

export const isDecisionRuleEdge = (
  edge: FlowGraphEdge,
): edge is GraphDecisionRuleEdge => {
  return edge.data.type === "decision";
};

export const createFallbackEdge = (
  sourceNodeId: string,
  targetNodeId: string,
): GraphDecisionFallbackEdge => ({
  data: {
    type: "fallback",
  },
  id: `fallback:${sourceNodeId}:${targetNodeId}`,
  source: sourceNodeId,
  sourceHandle: DECISION_FALLBACK_SOURCE_HANDLE_ID,
  target: targetNodeId,
  type: "builder",
});

export const formatComparisonOperand = (
  operand: ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"],
) => {
  if (typeof operand === "string") {
    return operand.length > 0 ? `"${operand}"` : '""';
  }

  if (typeof operand === "number") {
    return operand.toString();
  }

  if (operand.type === "randomNumber") {
    return `Random ${operand.min}-${operand.max}`;
  }

  return "Step value";
};

export const formatComparisonStatement = (
  statement: DecisionConditionType["statement"],
) => {
  if (statement.type !== "comparison") {
    return "Advanced rule";
  }

  return `${formatComparisonOperand(statement.leftValue)} ${statement.operator} ${formatComparisonOperand(statement.rightValue)}`;
};

export const flowToReactFlow = (flow: FlowWithNodesType): FlowGraph => {
  return FlowBuilderEntity.fromFlow(flow).getGraph();
};
