import type {
  FlowGraph,
  GraphDecisionNode,
} from "~shared/entities/FlowGraphEntity/types/flowGraph";
import type {
  BuilderDecisionNodeInputType,
  BuilderStepInputType,
} from "~shared/http/schemas/flows/builder/common";
import type { UpdateBuilderInput } from "~shared/http/schemas/flows/builder/updateBuilder";
import { NodeType } from "~shared/types/enums";

class FlowBuilderEntity {
  private nodes: UpdateBuilderInput;

  constructor(nodes: UpdateBuilderInput) {
    this.nodes = nodes;
  }

  static fromGraph(graph: FlowGraph) {
    const nodes: UpdateBuilderInput = [];

    graph.nodes.forEach((node) => {
      if (node.type === "decision") {
        const decisionNode = node as GraphDecisionNode;
        const fallbackEdge = graph.edges.find(
          (edge) =>
            edge.source === decisionNode.id && edge.data.type === "fallback",
        );

        nodes.push({
          // Refactor into flatter structure with generateConditionEdges for runtime edge injection instead of managing everything
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
          type: NodeType.DECISION,
        });
      } else {
        const stepEdge = graph.edges.find(
          (edge) => edge.source === node.id && edge.data.type === "step",
        );

        nodes.push({
          coordinates: node.position,
          name: node.data.name,
          nextNodeId: stepEdge?.target ?? null,
          nodeId: node.id,
          type: NodeType.STEP,
        });
      }
    });

    return new FlowBuilderEntity(nodes);
  }

  getPayload() {
    return this.nodes;
  }

  getValidationErrors() {
    const stepNodes = this.nodes.filter(
      (node): node is BuilderStepInputType => node.type === NodeType.STEP,
    );
    const decisionNodes = this.nodes.filter(
      (node): node is BuilderDecisionNodeInputType =>
        node.type === NodeType.DECISION,
    );
    const submittedStepNodeIds = new Set<string>();
    const submittedDecisionNodeIds = new Set<string>();
    const submittedConditionIds = new Set<string>();
    const submittedNodeIds = new Set<string>();
    const errors: string[] = [];

    for (const step of stepNodes) {
      if (!step.name.trim()) {
        errors.push(`Step "${step.nodeId}" needs a name.`);
      }

      if (submittedStepNodeIds.has(step.nodeId)) {
        errors.push(`Step node id "${step.nodeId}" is duplicated.`);
      }

      submittedStepNodeIds.add(step.nodeId);
      submittedNodeIds.add(step.nodeId);
    }

    for (const decisionNode of decisionNodes) {
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

    for (const step of stepNodes) {
      if (step.nextNodeId !== null && !submittedNodeIds.has(step.nextNodeId)) {
        errors.push(`Step "${step.name}" points at a missing next node.`);
      }
    }

    for (const decisionNode of decisionNodes) {
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
          condition.toNodeId !== null &&
          !submittedNodeIds.has(condition.toNodeId)
        ) {
          errors.push(
            `Decision "${decisionNode.name}" has a rule pointing at a missing node.`,
          );
        }
      }
    }

    const entryNodes = new Set<string>(submittedNodeIds);

    for (const step of stepNodes) {
      if (step.nextNodeId) {
        entryNodes.delete(step.nextNodeId);
      }
    }

    for (const decisionNode of decisionNodes) {
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
      ...stepNodes.map((step) => [step.nodeId, step] as const),
      ...decisionNodes.map(
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
      const adjacentNodeIds = !node
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
