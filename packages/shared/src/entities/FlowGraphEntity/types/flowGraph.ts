import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";

import type { DecisionConditionType } from "~shared/http/schemas/flows/common";
import type { NodeType } from "~shared/types/enums";

type EdgeWithRequiredData<T extends Record<string, unknown>> = {
  data: T;
} & ReactFlowEdge<T>;

export type FlowGraph = {
  edges: FlowGraphEdge[];
  nodes: FlowGraphNode[];
};

export type FlowGraphEdge =
  | GraphDecisionFallbackEdge
  | GraphDecisionRuleEdge
  | GraphStepEdge;
export type FlowGraphNode = GraphDecisionNode | GraphStepNode;
export type GraphDecisionFallbackEdge =
  EdgeWithRequiredData<GraphDecisionFallbackEdgeData>;

export type GraphDecisionFallbackEdgeData = {
  type: "fallback";
};

export type GraphDecisionNode = ReactFlowNode<
  GraphDecisionNodeData,
  "decision"
>;

export type GraphDecisionNodeData = {
  name: string;
  rules: Array<{
    conditionId: string;
    statement: DecisionConditionType["statement"];
  }>;
  type: NodeType.DECISION;
};

export type GraphDecisionRuleEdge =
  EdgeWithRequiredData<GraphDecisionRuleEdgeData>;

export type GraphDecisionRuleEdgeData = {
  conditionId: string;
  conditionOrder: number;
  statement: DecisionConditionType["statement"];
  type: "decision";
};

export type GraphStepEdge = EdgeWithRequiredData<GraphStepEdgeData>;

export type GraphStepEdgeData = {
  type: "step";
};

export type GraphStepNode = ReactFlowNode<GraphStepNodeData, "step">;

export type GraphStepNodeData = {
  name: string;
  type: NodeType.STEP;
};
