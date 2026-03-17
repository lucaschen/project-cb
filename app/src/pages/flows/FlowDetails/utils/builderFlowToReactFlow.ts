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
import { DECISION_FALLBACK_SOURCE_HANDLE_ID } from "@packages/shared/entities/FlowGraphEntity/utils/graph";
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
