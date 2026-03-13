import type {
  FlowDecisionNodeType,
  FlowNodeType,
  FlowWithNodesType,
} from "@packages/shared/http/schemas/flows/common";
import type {
  Edge,
  Node,
  XYPosition,
} from "@xyflow/react";

const FALLBACK_NODE_X = 120;
const FALLBACK_NODE_Y = 120;
const FALLBACK_NODE_X_GAP = 280;

export type BuilderFlowNodeData = {
  conditionCount?: number;
  elementCount?: number;
  kind: "decision" | "step";
  name: string;
};

export type BuilderFlowNode = Node<BuilderFlowNodeData>;

export type BuilderFlowEdge = Edge<{
  kind: "default" | "decision" | "fallback";
}>;

const getFallbackPosition = (index: number): XYPosition => {
  return {
    x: FALLBACK_NODE_X + index * FALLBACK_NODE_X_GAP,
    y: FALLBACK_NODE_Y,
  };
};

const getNodePosition = (node: FlowNodeType, index: number): XYPosition => {
  return node.coordinates ?? getFallbackPosition(index);
};

const getFlowNodeData = (node: FlowNodeType): BuilderFlowNodeData => {
  if (node.type === "STEP") {
    return {
      elementCount: node.elements.length,
      kind: "step",
      name: node.name,
    };
  }

  return {
    conditionCount: node.conditions.length,
    kind: "decision",
    name: node.name,
  };
};

const getDecisionEdges = (node: FlowDecisionNodeType): BuilderFlowEdge[] => {
  return [
    ...node.conditions.map((condition, index) => ({
      data: {
        kind: "decision" as const,
      },
      id: `${node.nodeId}-${condition.id}`,
      label: `Rule ${index + 1}`,
      source: node.nodeId,
      target: condition.toNodeId,
      type: "smoothstep",
    })),
    {
      data: {
        kind: "fallback" as const,
      },
      id: `${node.nodeId}-fallback`,
      label: "Fallback",
      source: node.nodeId,
      target: node.fallbackNextNodeId,
      type: "smoothstep",
    },
  ];
};

export const flowToReactFlow = (flow: FlowWithNodesType) => {
  const nodes: BuilderFlowNode[] = flow.nodes.map((node, index) => ({
    data: getFlowNodeData(node),
    draggable: false,
    id: node.nodeId,
    position: getNodePosition(node, index),
    selectable: true,
    type: node.type === "STEP" ? "step" : "decision",
  }));

  const edges: BuilderFlowEdge[] = flow.nodes.flatMap((node) => {
    if (node.type === "STEP") {
      return node.nextNodeId
        ? [
            {
              data: {
                kind: "default" as const,
              },
              id: `${node.nodeId}-${node.nextNodeId}`,
              source: node.nodeId,
              target: node.nextNodeId,
              type: "smoothstep",
            },
          ]
        : [];
    }

    return getDecisionEdges(node);
  });

  return {
    edges,
    nodes,
  };
};
