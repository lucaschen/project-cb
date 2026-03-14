import type { DecisionConditionType } from "@packages/shared/http/schemas/flows/common";
import { NodeType } from "@packages/shared/types/enums";

import type {
  BuilderCanvasGraph,
  BuilderFlowEdge,
  BuilderFlowNode,
} from "./builderFlowToReactFlow";
import {
  isBuilderStepNode,
  isDefaultEdge,
  isFallbackEdge,
} from "./builderFlowToReactFlow";

export type DerivedBuilderFlow = {
  nodes: Array<
    | {
        conditions: Array<{
          id: string;
          order: number;
          statement: DecisionConditionType["statement"];
          toNodeId: string;
        }>;
        coordinates: { x: number; y: number };
        fallbackNextNodeId: string;
        name: string;
        nodeId: string;
        type: NodeType.DECISION;
      }
    | {
        coordinates: { x: number; y: number };
        elements: Extract<
          BuilderFlowNode,
          { type: "step" }
        >["data"]["elements"];
        name: string;
        nextNodeId: string | null;
        nodeId: string;
        type: NodeType.STEP;
      }
  >;
};

const getNodeCoordinates = (node: BuilderFlowNode) => ({
  x: node.position.x,
  y: node.position.y,
});

const getNextNodeId = (edges: BuilderFlowEdge[], nodeId: string) => {
  return (
    edges.find((edge) => edge.source === nodeId && isDefaultEdge(edge))
      ?.target ?? null
  );
};

const getFallbackTargetId = (edges: BuilderFlowEdge[], nodeId: string) => {
  return (
    edges.find((edge) => edge.source === nodeId && isFallbackEdge(edge))
      ?.target ?? ""
  );
};

const getDecisionConditions = (
  node: Extract<BuilderFlowNode, { type: "decision" }>,
) => {
  return node.data.rules.map((rule, index) => ({
    id: rule.conditionId,
    order: index,
    statement: rule.statement,
    toNodeId: rule.targetNodeId ?? "",
  }));
};

export const canvasGraphToBuilderFlow = ({
  edges,
  nodes,
}: BuilderCanvasGraph): DerivedBuilderFlow => {
  return {
    nodes: nodes.map((node) => {
      if (isBuilderStepNode(node)) {
        return {
          coordinates: getNodeCoordinates(node),
          elements: node.data.elements,
          name: node.data.name,
          nextNodeId: getNextNodeId(edges, node.id),
          nodeId: node.id,
          type: NodeType.STEP as const,
        };
      }

      return {
        conditions: getDecisionConditions(node),
        coordinates: getNodeCoordinates(node),
        fallbackNextNodeId: getFallbackTargetId(edges, node.id),
        name: node.data.name,
        nodeId: node.id,
        type: NodeType.DECISION as const,
      };
    }),
  };
};
