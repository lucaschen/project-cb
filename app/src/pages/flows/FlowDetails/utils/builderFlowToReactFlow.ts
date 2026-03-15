import type { ComparisonStatement } from "@packages/shared/db/schemas/conditionStatement";
import type {
  DecisionConditionType,
  DecisionNodeType,
  FlowStepElementType,
  FlowWithNodesType,
  NodePayloadType,
  StepNodeType,
} from "@packages/shared/http/schemas/flows/common";
import { NodeType } from "@packages/shared/types/enums";
import type { Edge, Node, XYPosition } from "@xyflow/react";

const FALLBACK_NODE_X = 120;
const FALLBACK_NODE_Y = 120;
const FALLBACK_NODE_X_GAP = 280;

export type BuilderStepNodeData = {
  elements: FlowStepElementType[];
  kind: "step";
  name: string;
};

export type BuilderDecisionNodeData = {
  kind: "decision";
  name: string;
  rules: Array<{
    conditionId: string;
    statement: DecisionConditionType["statement"];
    targetNodeId: string | null;
  }>;
};

export type BuilderStepNode = Node<BuilderStepNodeData, "step">;
export type BuilderDecisionNode = Node<BuilderDecisionNodeData, "decision">;
export type BuilderFlowNode = BuilderDecisionNode | BuilderStepNode;

export type BuilderDefaultEdgeData = {
  kind: "default";
};

export type BuilderFallbackEdgeData = {
  kind: "fallback";
};

export type BuilderDecisionEdgeData = {
  conditionId: string;
  conditionOrder: number;
  kind: "decision";
  statement: DecisionConditionType["statement"];
};

export type BuilderFlowEdgeData =
  | BuilderDecisionEdgeData
  | BuilderDefaultEdgeData
  | BuilderFallbackEdgeData;

type EdgeWithRequiredData<T extends Record<string, unknown>> = Edge<T> & {
  data: T;
};

export type BuilderDefaultEdge = EdgeWithRequiredData<BuilderDefaultEdgeData>;
export type BuilderFallbackEdge = EdgeWithRequiredData<BuilderFallbackEdgeData>;
export type BuilderDecisionEdge = EdgeWithRequiredData<BuilderDecisionEdgeData>;
export type BuilderFlowEdge =
  | BuilderDecisionEdge
  | BuilderDefaultEdge
  | BuilderFallbackEdge;

export type BuilderCanvasGraph = {
  edges: BuilderFlowEdge[];
  nodes: BuilderFlowNode[];
};

export const DECISION_FALLBACK_SOURCE_HANDLE_ID = "decision-fallback";

export const getDecisionRuleSourceHandleId = (conditionId: string) =>
  `decision-rule:${conditionId}`;

export const isDecisionFallbackSourceHandle = (
  sourceHandle: string | null | undefined,
) => sourceHandle === DECISION_FALLBACK_SOURCE_HANDLE_ID;

export const getDecisionConditionIdFromSourceHandle = (
  sourceHandle: string | null | undefined,
) => {
  if (!sourceHandle?.startsWith("decision-rule:")) {
    return null;
  }

  return sourceHandle.slice("decision-rule:".length) || null;
};

export const getFallbackPosition = (index: number): XYPosition => ({
  x: FALLBACK_NODE_X + index * FALLBACK_NODE_X_GAP,
  y: FALLBACK_NODE_Y,
});

const getNodePosition = (node: NodePayloadType, index: number): XYPosition => {
  return node.coordinates ?? getFallbackPosition(index);
};

const isStepNodePayload = (node: NodePayloadType): node is StepNodeType => {
  return node.type === NodeType.STEP;
};

const isDecisionNodePayload = (
  node: NodePayloadType,
): node is DecisionNodeType => {
  return node.type === NodeType.DECISION;
};

export const isBuilderStepNode = (
  node: BuilderFlowNode,
): node is BuilderStepNode => {
  return node.type === "step";
};

export const isBuilderDecisionNode = (
  node: BuilderFlowNode,
): node is BuilderDecisionNode => {
  return node.type === "decision";
};

export const isDefaultEdge = (
  edge: BuilderFlowEdge,
): edge is BuilderDefaultEdge => {
  return edge.data.kind === "default";
};

export const isFallbackEdge = (
  edge: BuilderFlowEdge,
): edge is BuilderFallbackEdge => {
  return edge.data.kind === "fallback";
};

export const isDecisionEdge = (
  edge: BuilderFlowEdge,
): edge is BuilderDecisionEdge => {
  return edge.data.kind === "decision";
};

const getDecisionNodeData = (
  node: DecisionNodeType,
): BuilderDecisionNodeData => {
  return {
    kind: "decision",
    name: node.name,
    rules: [...node.conditions]
      .sort((left, right) => left.order - right.order)
      .map((condition) => ({
        conditionId: condition.id,
        statement: condition.statement,
        targetNodeId: condition.toNodeId,
      })),
  };
};

const getStepNodeData = (node: StepNodeType): BuilderStepNodeData => {
  return {
    elements: node.elements,
    kind: "step",
    name: node.name,
  };
};

export const createDefaultEdge = (
  sourceNodeId: string,
  targetNodeId: string,
): BuilderDefaultEdge => ({
  data: {
    kind: "default",
  },
  id: `default:${sourceNodeId}:${targetNodeId}`,
  source: sourceNodeId,
  target: targetNodeId,
  type: "builder",
});

export const createFallbackEdge = (
  sourceNodeId: string,
  targetNodeId: string,
): BuilderFallbackEdge => ({
  data: {
    kind: "fallback",
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

export const createDecisionEdge = ({
  conditionId,
  conditionOrder,
  sourceNodeId,
  statement,
  targetNodeId,
}: {
  conditionId: string;
  conditionOrder: number;
  sourceNodeId: string;
  statement: DecisionConditionType["statement"];
  targetNodeId: string;
}): BuilderDecisionEdge => ({
  data: {
    conditionId,
    conditionOrder,
    kind: "decision",
    statement,
  },
  id: `decision:${sourceNodeId}:${conditionId}`,
  label: `Rule ${conditionOrder + 1}`,
  source: sourceNodeId,
  sourceHandle: getDecisionRuleSourceHandleId(conditionId),
  target: targetNodeId,
  type: "builder",
});

const getDecisionEdges = (node: DecisionNodeType): BuilderFlowEdge[] => {
  return [
    ...node.conditions.map((condition) =>
      createDecisionEdge({
        conditionId: condition.id,
        conditionOrder: condition.order,
        sourceNodeId: node.nodeId,
        statement: condition.statement,
        targetNodeId: condition.toNodeId,
      }),
    ),
    createFallbackEdge(node.nodeId, node.fallbackNextNodeId),
  ];
};

export const createStepNode = (
  position: XYPosition,
  nodeId = crypto.randomUUID(),
): BuilderStepNode => ({
  data: {
    elements: [],
    kind: "step",
    name: "Untitled step",
  },
  id: nodeId,
  position,
  selectable: true,
  type: "step",
});

export const createDecisionNode = (
  position: XYPosition,
  nodeId = crypto.randomUUID(),
): BuilderDecisionNode => ({
  data: {
    kind: "decision",
    name: "Untitled decision",
    rules: [],
  },
  id: nodeId,
  position,
  selectable: true,
  type: "decision",
});

export const flowToReactFlow = (
  flow: FlowWithNodesType,
): BuilderCanvasGraph => {
  const nodes = flow.nodes.flatMap((node, index): BuilderFlowNode[] => {
    if (isStepNodePayload(node)) {
      return [
        {
          data: getStepNodeData(node),
          id: node.nodeId,
          position: getNodePosition(node, index),
          selectable: true,
          type: "step",
        } satisfies BuilderStepNode,
      ];
    }

    if (isDecisionNodePayload(node)) {
      return [
        {
          data: getDecisionNodeData(node),
          id: node.nodeId,
          position: getNodePosition(node, index),
          selectable: true,
          type: "decision",
        } satisfies BuilderDecisionNode,
      ];
    }

    return [];
  });

  const edges: BuilderFlowEdge[] = flow.nodes.flatMap((node) => {
    if (isStepNodePayload(node)) {
      return node.nextNodeId
        ? [createDefaultEdge(node.nodeId, node.nextNodeId)]
        : [];
    }

    return isDecisionNodePayload(node) ? getDecisionEdges(node) : [];
  });

  return {
    edges,
    nodes,
  };
};
