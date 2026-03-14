import type {
  BuilderDecisionNodeInputType,
  BuilderStepInputType,
} from "~shared/http/schemas/flows/builder/common";
import type { UpdateBuilderInput } from "~shared/http/schemas/flows/builder/updateBuilder";

type FlowBuilderNode =
  | ({ type: "decision" } & BuilderDecisionNodeInputType)
  | ({ type: "step" } & BuilderStepInputType);

const getNodesByType = (nodes: FlowBuilderNode[]) =>
  nodes.reduce<{
    decisionNodes: Array<Extract<FlowBuilderNode, { type: "decision" }>>;
    stepNodes: Array<Extract<FlowBuilderNode, { type: "step" }>>;
  }>(
    (acc, node) => {
      if (node.type === "step") {
        acc.stepNodes.push(node);
      } else {
        acc.decisionNodes.push(node);
      }

      return acc;
    },
    {
      decisionNodes: [],
      stepNodes: [],
    },
  );

export default class FlowBuilderEntity {
  private constructor(private readonly nodes: FlowBuilderNode[]) {}

  static fromUpdateBuilderInput(input: UpdateBuilderInput) {
    return new FlowBuilderEntity([
      ...input.steps.map((step) => ({
        ...step,
        type: "step" as const,
      })),
      ...input.decisionNodes.map((decisionNode) => ({
        ...decisionNode,
        type: "decision" as const,
      })),
    ]);
  }

  isDirtyComparedTo(other: FlowBuilderEntity) {
    return (
      JSON.stringify(this.toUpdateBuilderInput()) !==
      JSON.stringify(other.toUpdateBuilderInput())
    );
  }

  toUpdateBuilderInput(): UpdateBuilderInput {
    const { decisionNodes, stepNodes } = getNodesByType(this.nodes);

    return {
      decisionNodes: decisionNodes.map(({ type: _type, ...decisionNode }) => ({
        ...decisionNode,
        conditions: decisionNode.conditions.map((condition) => ({
          ...condition,
        })),
      })),
      steps: stepNodes.map(({ type: _type, ...step }) => ({
        ...step,
      })),
    };
  }

  validate(): string[] {
    const { decisionNodes, stepNodes } = getNodesByType(this.nodes);
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
      if (!submittedNodeIds.has(decisionNode.fallbackNextNodeId)) {
        errors.push(
          `Decision "${decisionNode.name}" needs a valid fallback target.`,
        );
      }

      for (const condition of decisionNode.conditions) {
        if (!submittedNodeIds.has(condition.toNodeId)) {
          errors.push(
            `Decision "${decisionNode.name}" has a rule pointing at a missing node.`,
          );
        }
      }
    }

    return [
      ...errors,
      ...this.getDisconnectedStepErrors(),
      ...this.getCycleErrors(),
    ];
  }

  private getCycleErrors() {
    const visitingNodeIds = new Set<string>();
    const visitedNodeIds = new Set<string>();
    const nodesById = new Map(this.nodes.map((node) => [node.nodeId, node]));

    const getAdjacentNodeIds = (nodeId: string) => {
      const node = nodesById.get(nodeId);

      if (!node) {
        return [];
      }

      if (node.type === "step") {
        return node.nextNodeId ? [node.nextNodeId] : [];
      }

      return [
        node.fallbackNextNodeId,
        ...node.conditions.map((condition) => condition.toNodeId),
      ];
    };

    const visit = (nodeId: string): string[] => {
      if (visitingNodeIds.has(nodeId)) {
        return [`Builder graph contains a cycle involving node ${nodeId}.`];
      }

      if (visitedNodeIds.has(nodeId)) {
        return [];
      }

      visitingNodeIds.add(nodeId);

      for (const adjacentNodeId of getAdjacentNodeIds(nodeId)) {
        const nestedErrors = visit(adjacentNodeId);

        if (nestedErrors.length > 0) {
          return nestedErrors;
        }
      }

      visitingNodeIds.delete(nodeId);
      visitedNodeIds.add(nodeId);

      return [];
    };

    for (const nodeId of this.nodes.map((node) => node.nodeId)) {
      const errors = visit(nodeId);

      if (errors.length > 0) {
        return errors;
      }
    }

    return [];
  }

  private getDisconnectedStepErrors() {
    const entryNodes = new Set(this.nodes.map((node) => node.nodeId));

    this.nodes.forEach((node) => {
      if (node.type === "step" && node.nextNodeId) {
        entryNodes.delete(node.nextNodeId);
      }

      if (node.type === "decision") {
        entryNodes.delete(node.fallbackNextNodeId);

        for (const condition of node.conditions) {
          entryNodes.delete(condition.toNodeId);
        }
      }
    });

    return entryNodes.size > 1
      ? ["Builder graph must have a single entry node."]
      : [];
  }
}
