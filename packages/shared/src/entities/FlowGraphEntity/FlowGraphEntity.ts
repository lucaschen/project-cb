import type { XYPosition } from "@xyflow/react";
import * as R from "ramda";

import type { NodeType } from "~shared/types/enums";

import FlowGraphDecisionNodeEntity from "../FlowGraphDecisionNodeEntity/FlowGraphDecisionNodeEntity";
import { createDecisionEdge } from "../FlowGraphDecisionNodeEntity/utils/graphDecisionNode";
import type {
  FlowGraph,
  FlowGraphEdge,
  FlowGraphNode,
  GraphDecisionNode,
  GraphDecisionRuleEdge,
  GraphStepNode,
} from "./types/flowGraph";
import {
  createGraphDecisionFallbackEdge,
  createGraphDecisionNode,
  createGraphStepEdge,
  createGraphStepNode,
  getDecisionConditionIdFromSourceHandle,
} from "./utils/graph";

class FlowGraphEntity {
  private flowGraph: {
    edges: FlowGraphEdge[];
    nodes: (FlowGraphDecisionNodeEntity | GraphStepNode)[];
  };

  constructor(
    graph: FlowGraph = {
      edges: [],
      nodes: [],
    },
  ) {
    const nodes = graph.nodes.map((node) => {
      if (node.type === "decision") {
        return this.wrapDecisionNode(node);
      }

      return node;
    });

    this.flowGraph = {
      edges: graph.edges,
      nodes,
    };
  }

  addNode({
    data,
    droppedByNodeId,
    nodeId,
    position,
    type,
  }: { droppedByNodeId?: string; nodeId?: string; position: XYPosition } & (
    | {
        data?: Partial<GraphDecisionNode["data"]>;
        type: "decision";
      }
    | {
        data?: Partial<GraphStepNode["data"]>;
        type: "step";
      }
  )) {
    const node =
      type === "step"
        ? createGraphStepNode({
            data,
            nodeId,
            position,
          })
        : this.wrapDecisionNode(
            createGraphDecisionNode({
              data,
              nodeId,
              position,
            }),
          );

    if (droppedByNodeId) {
      // TODO: set next node id of previous node
      // TODO: add new edge
    }

    this.flowGraph.nodes.push(node);

    return node;
  }

  getGraph() {
    return R.clone(this.flowGraph);
  }

  getNodeById(nodeId: string) {
    return this.flowGraph.nodes.find((node) => node.id === nodeId) ?? null;
  }

  removeEdgeById(edgeId: string): void {
    this.flowGraph.edges = this.flowGraph.edges.filter(
      (edge) => edge.id !== edgeId,
    );
  }

  removeNodeById(nodeId: string): void {
    this.flowGraph = {
      edges: this.flowGraph.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
      nodes: this.flowGraph.nodes.filter((node) => node.id !== nodeId),
    };
  }

  setConnection({
    sourceHandle,
    sourceNodeId,
    targetNodeId,
  }: {
    sourceHandle?: string | null;
    sourceNodeId: string;
    targetNodeId: string | null;
  }): FlowGraphEdge | null {
    const sourceNode = this.getNodeById(sourceNodeId);
    const targetNode = targetNodeId ? this.getNodeById(targetNodeId) : null;

    if (!sourceNode) {
      return null;
    }

    const conditionId = getDecisionConditionIdFromSourceHandle(sourceHandle);

    if (!targetNode) {
      this.flowGraph.edges = this.flowGraph.edges.filter((edge) => {
        if (sourceNode.type === "step") {
          return !(edge.source === sourceNodeId && edge.data.type === "step");
        }

        if (conditionId) {
          return !(
            edge.source === sourceNodeId &&
            edge.data.type === "decision" &&
            edge.data.conditionId === conditionId
          );
        }

        return !(edge.source === sourceNodeId && edge.data.type === "fallback");
      });

      return null;
    }

    if (sourceNodeId === targetNodeId) {
      return null;
    }

    let newEdge: FlowGraphEdge;

    if (sourceNode.type === "step") {
      newEdge = createGraphStepEdge({
        sourceNodeId,
        targetNodeId: targetNode.id,
      });
    } else if (sourceNode.type === "decision") {
      if (conditionId) {
        const conditionOrder = sourceNode.data.rules.findIndex(
          (rule) => rule.conditionId === conditionId,
        );
        const rule = sourceNode.data.rules[conditionOrder];

        if (!rule) {
          return null;
        }

        newEdge = createDecisionEdge({
          conditionId,
          conditionOrder,
          sourceNodeId,
          statement: rule.statement,
          targetNodeId: targetNode.id,
        });
      } else {
        newEdge = createGraphDecisionFallbackEdge({
          sourceNodeId,
          targetNodeId: targetNode.id,
        });
      }
    } else {
      return null;
    }

    this.flowGraph.edges = this.flowGraph.edges
      .filter((edge) => {
        if (sourceNode.type === "step") {
          return !(edge.source === sourceNodeId && edge.data.type === "step");
        }

        if (conditionId) {
          return !(
            edge.source === sourceNodeId &&
            edge.data.type === "decision" &&
            edge.data.conditionId === conditionId
          );
        }

        return !(edge.source === sourceNodeId && edge.data.type === "fallback");
      })
      .concat(newEdge);

    return newEdge;
  }

  private syncDecisionRuleEdges(decisionNode: FlowGraphDecisionNodeEntity) {
    this.flowGraph.edges = this.flowGraph.edges
      .filter((edge) => {
        if (edge.source !== decisionNode.id || edge.data.type !== "decision") {
          return true;
        }

        const decisionEdge = edge as GraphDecisionRuleEdge;

        return decisionNode.data.rules.some(
          (rule) => rule.conditionId === decisionEdge.data.conditionId,
        );
      })
      .map((edge) => {
        if (edge.source !== decisionNode.id || edge.data.type !== "decision") {
          return edge;
        }

        const decisionEdge = edge as GraphDecisionRuleEdge;
        const conditionOrder = decisionNode.data.rules.findIndex(
          (rule) => rule.conditionId === decisionEdge.data.conditionId,
        );
        const rule = decisionNode.data.rules[conditionOrder];

        if (!rule) {
          return edge;
        }

        return createDecisionEdge({
          conditionId: rule.conditionId,
          conditionOrder,
          sourceNodeId: decisionNode.id,
          statement: rule.statement,
          targetNodeId: edge.target,
        });
      });
  }

  private wrapDecisionNode(node: GraphDecisionNode) {
    const decisionNode = new FlowGraphDecisionNodeEntity(node, () => {
      this.syncDecisionRuleEdges(decisionNode);
    });

    return decisionNode;
  }
}

export default FlowGraphEntity;
