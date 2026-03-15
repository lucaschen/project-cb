import * as R from "ramda";

import FlowGraphEntity from "~shared/entities/FlowGraphEntity/FlowGraphEntity";
import type {
  FlowGraph,
  GraphDecisionNode,
  GraphStepNode,
} from "~shared/entities/FlowGraphEntity/types/flowGraph";
import { getDecisionRuleSourceHandleId } from "~shared/entities/FlowGraphEntity/utils/graph";
import type {
  FlowStepElementType,
  FlowWithNodesType,
} from "~shared/http/schemas/flows/common";
import type {
  BuilderDecisionNodeInputType,
  BuilderStepInputType,
} from "~shared/http/schemas/flows/builder/common";
import type { UpdateBuilderInput } from "~shared/http/schemas/flows/builder/updateBuilder";
import { NodeType } from "~shared/types/enums";

const FALLBACK_NODE_X = 120;
const FALLBACK_NODE_Y = 120;
const FALLBACK_NODE_X_GAP = 280;

const getFallbackPosition = (index: number) => ({
  x: FALLBACK_NODE_X + index * FALLBACK_NODE_X_GAP,
  y: FALLBACK_NODE_Y,
});

class FlowBuilderEntity {
  private payload: UpdateBuilderInput;

  private stepElementsByNodeId = new Map<string, FlowStepElementType[]>();

  constructor(payload: UpdateBuilderInput) {
    this.payload = R.clone(payload);
  }

  static fromFlow(flow: FlowWithNodesType) {
    const payload: UpdateBuilderInput = {
      decisionNodes: [],
      stepNodes: [],
    };
    const stepElementsByNodeId = new Map<string, FlowStepElementType[]>();

    flow.nodes.forEach((node, index) => {
      const coordinates = node.coordinates ?? getFallbackPosition(index);

      if (node.type === NodeType.STEP) {
        payload.stepNodes.push({
          coordinates,
          name: node.name,
          nextNodeId: node.nextNodeId,
          nodeId: node.nodeId,
        });
        stepElementsByNodeId.set(node.nodeId, node.elements);

        return;
      }

      payload.decisionNodes.push({
        conditions: [...node.conditions]
          .sort(
            (left, right) => left.order - right.order || left.id.localeCompare(right.id),
          )
          .map((condition) => ({
            id: condition.id,
            statement: condition.statement,
            toNodeId: condition.toNodeId,
          })),
        coordinates,
        fallbackNextNodeId: node.fallbackNextNodeId,
        name: node.name,
        nodeId: node.nodeId,
      });
    });

    const entity = new FlowBuilderEntity(payload);
    entity.stepElementsByNodeId = stepElementsByNodeId;

    return entity;
  }

  static fromGraph(graph: FlowGraph) {
    const payload: UpdateBuilderInput = {
      decisionNodes: [],
      stepNodes: [],
    };
    const stepElementsByNodeId = new Map<string, FlowStepElementType[]>();

    graph.nodes.forEach((node) => {
      if (node.type === "decision") {
        const decisionNode = node as GraphDecisionNode;
        const fallbackEdge = graph.edges.find(
          (edge) =>
            edge.source === decisionNode.id && edge.data.type === "fallback",
        );

        payload.decisionNodes.push({
          conditions: decisionNode.data.rules.map((rule) => {
            const decisionEdge = graph.edges.find(
              (edge) =>
                edge.source === decisionNode.id &&
                edge.data.type === "decision" &&
                edge.data.conditionId === rule.conditionId,
            );

            return {
              id: rule.conditionId,
              statement: rule.statement,
              toNodeId: decisionEdge?.target ?? null,
            };
          }),
          coordinates: decisionNode.position,
          fallbackNextNodeId: fallbackEdge?.target ?? null,
          name: decisionNode.data.name,
          nodeId: decisionNode.id,
        });

        return;
      }

      const stepNode = node as GraphStepNode;
      const stepEdge = graph.edges.find(
        (edge) => edge.source === stepNode.id && edge.data.type === "step",
      );

      payload.stepNodes.push({
        coordinates: stepNode.position,
        name: stepNode.data.name,
        nextNodeId: stepEdge?.target ?? null,
        nodeId: stepNode.id,
      });
      stepElementsByNodeId.set(stepNode.id, stepNode.data.elements);
    });

    const entity = new FlowBuilderEntity(payload);
    entity.stepElementsByNodeId = stepElementsByNodeId;

    return entity;
  }

  getPayload() {
    return R.clone(this.payload);
  }

  getGraph(): FlowGraph {
    const flowGraphEntity = new FlowGraphEntity();

    this.payload.stepNodes.forEach((stepNode) => {
      flowGraphEntity.addNode({
        data: {
          elements: this.stepElementsByNodeId.get(stepNode.nodeId) ?? [],
          name: stepNode.name,
          type: NodeType.STEP,
        },
        nodeId: stepNode.nodeId,
        position: stepNode.coordinates,
        type: "step",
      });
    });

    this.payload.decisionNodes.forEach((decisionNode) => {
      flowGraphEntity.addNode({
        data: {
          name: decisionNode.name,
          rules: decisionNode.conditions.map((condition) => ({
            conditionId: condition.id,
            statement: condition.statement,
          })),
          type: NodeType.DECISION,
        },
        nodeId: decisionNode.nodeId,
        position: decisionNode.coordinates,
        type: "decision",
      });
    });

    this.payload.stepNodes.forEach((stepNode) => {
      flowGraphEntity.setConnection({
        sourceNodeId: stepNode.nodeId,
        targetNodeId: stepNode.nextNodeId,
      });
    });

    this.payload.decisionNodes.forEach((decisionNode) => {
      flowGraphEntity.setConnection({
        sourceNodeId: decisionNode.nodeId,
        targetNodeId: decisionNode.fallbackNextNodeId,
      });

      decisionNode.conditions.forEach((condition) => {
        flowGraphEntity.setConnection({
          sourceHandle: getDecisionRuleSourceHandleId(condition.id),
          sourceNodeId: decisionNode.nodeId,
          targetNodeId: condition.toNodeId,
        });
      });
    });

    return flowGraphEntity.getGraph();
  }

  getValidationErrors() {
    const submittedStepNodeIds = new Set<string>();
    const submittedDecisionNodeIds = new Set<string>();
    const submittedConditionIds = new Set<string>();
    const submittedNodeIds = new Set<string>();
    const errors: string[] = [];

    for (const step of this.payload.stepNodes) {
      if (!step.name.trim()) {
        errors.push(`Step "${step.nodeId}" needs a name.`);
      }

      if (submittedStepNodeIds.has(step.nodeId)) {
        errors.push(`Step node id "${step.nodeId}" is duplicated.`);
      }

      submittedStepNodeIds.add(step.nodeId);
      submittedNodeIds.add(step.nodeId);
    }

    for (const decisionNode of this.payload.decisionNodes) {
      if (!decisionNode.name.trim()) {
        errors.push(`Decision "${decisionNode.nodeId}" needs a name.`);
      }

      if (submittedDecisionNodeIds.has(decisionNode.nodeId)) {
        errors.push(`Decision node id "${decisionNode.nodeId}" is duplicated.`);
      }

      if (submittedStepNodeIds.has(decisionNode.nodeId)) {
        errors.push(
          `Node id "${decisionNode.nodeId}" cannot be both a step and a decision node.`,
        );
      }

      submittedDecisionNodeIds.add(decisionNode.nodeId);
      submittedNodeIds.add(decisionNode.nodeId);

      for (const condition of decisionNode.conditions) {
        if (submittedConditionIds.has(condition.id)) {
          errors.push(`Decision condition id "${condition.id}" is duplicated.`);
        }

        submittedConditionIds.add(condition.id);
      }
    }

    for (const step of this.payload.stepNodes) {
      if (step.nextNodeId !== null && !submittedNodeIds.has(step.nextNodeId)) {
        errors.push(`Step "${step.name}" points at a missing next node.`);
      }
    }

    for (const decisionNode of this.payload.decisionNodes) {
      if (
        decisionNode.fallbackNextNodeId === null ||
        !submittedNodeIds.has(decisionNode.fallbackNextNodeId)
      ) {
        errors.push(
          `Decision "${decisionNode.name}" needs a valid fallback target.`,
        );
      }

      for (const condition of decisionNode.conditions) {
        if (
          condition.toNodeId === null ||
          !submittedNodeIds.has(condition.toNodeId)
        ) {
          errors.push(
            `Decision "${decisionNode.name}" has a rule pointing at a missing node.`,
          );
        }
      }
    }

    const entryNodes = new Set<string>(submittedNodeIds);

    for (const step of this.payload.stepNodes) {
      if (step.nextNodeId) {
        entryNodes.delete(step.nextNodeId);
      }
    }

    for (const decisionNode of this.payload.decisionNodes) {
      if (decisionNode.fallbackNextNodeId) {
        entryNodes.delete(decisionNode.fallbackNextNodeId);
      }

      for (const condition of decisionNode.conditions) {
        if (condition.toNodeId) {
          entryNodes.delete(condition.toNodeId);
        }
      }
    }

    if (entryNodes.size > 1) {
      errors.push("Builder graph must have a single entry node.");
    }

    const nodesById = new Map<
      string,
      BuilderDecisionNodeInputType | BuilderStepInputType
    >([
      ...this.payload.stepNodes.map((step) => [step.nodeId, step] as const),
      ...this.payload.decisionNodes.map(
        (decisionNode) => [decisionNode.nodeId, decisionNode] as const,
      ),
    ]);
    const visitingNodeIds = new Set<string>();
    const visitedNodeIds = new Set<string>();

    const visit = (nodeId: string): string[] => {
      if (visitingNodeIds.has(nodeId)) {
        return [`Builder graph contains a cycle involving node ${nodeId}.`];
      }

      if (visitedNodeIds.has(nodeId)) {
        return [];
      }

      visitingNodeIds.add(nodeId);

      const node = nodesById.get(nodeId);
      const adjacentNodeIds =
        !node
          ? []
          : "nextNodeId" in node
            ? node.nextNodeId
              ? [node.nextNodeId]
              : []
            : [
                node.fallbackNextNodeId,
                ...node.conditions.map((condition) => condition.toNodeId),
              ].filter((adjacentNodeId): adjacentNodeId is string =>
                Boolean(adjacentNodeId),
              );

      for (const adjacentNodeId of adjacentNodeIds) {
        const nestedErrors = visit(adjacentNodeId);

        if (nestedErrors.length > 0) {
          return nestedErrors;
        }
      }

      visitingNodeIds.delete(nodeId);
      visitedNodeIds.add(nodeId);

      return [];
    };

    for (const nodeId of submittedNodeIds) {
      const cycleErrors = visit(nodeId);

      if (cycleErrors.length > 0) {
        errors.push(...cycleErrors);
        break;
      }
    }

    return errors;
  }
}

export default FlowBuilderEntity;
