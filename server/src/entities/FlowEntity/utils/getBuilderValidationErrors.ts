import { UpdateBuilderInput } from "@packages/shared/http/schemas/flows/builder/updateBuilder";

const getBuilderValidationErrors = (payload: UpdateBuilderInput) => {
  const submittedStepNodeIds = new Set<string>();
  const submittedDecisionNodeIds = new Set<string>();
  const submittedConditionIds = new Set<string>();
  const submittedNodeIds = new Set<string>();
  const errors: string[] = [];

  for (const step of payload.stepNodes) {
    if (!step.name.trim()) {
      errors.push(`Step "${step.nodeId}" needs a name.`);
    }

    if (submittedStepNodeIds.has(step.nodeId)) {
      errors.push(`Step node id "${step.nodeId}" is duplicated.`);
    }

    submittedStepNodeIds.add(step.nodeId);
    submittedNodeIds.add(step.nodeId);
  }

  for (const decisionNode of payload.decisionNodes) {
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

  for (const step of payload.stepNodes) {
    if (step.nextNodeId !== null && !submittedNodeIds.has(step.nextNodeId)) {
      errors.push(`Step "${step.name}" points at a missing next node.`);
    }
  }

  for (const decisionNode of payload.decisionNodes) {
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

  const entryNodes = new Set<string>(submittedNodeIds);

  for (const step of payload.stepNodes) {
    if (step.nextNodeId) {
      entryNodes.delete(step.nextNodeId);
    }
  }

  for (const decisionNode of payload.decisionNodes) {
    entryNodes.delete(decisionNode.fallbackNextNodeId);

    for (const condition of decisionNode.conditions) {
      entryNodes.delete(condition.toNodeId);
    }
  }

  if (entryNodes.size > 1) {
    errors.push("Builder graph must have a single entry node.");
  }

  const nodesById = new Map<
    string,
    | UpdateBuilderInput["stepNodes"][number]
    | UpdateBuilderInput["decisionNodes"][number]
  >([
    ...payload.stepNodes.map((step) => [step.nodeId, step] as const),
    ...payload.decisionNodes.map(
      (decisionNode) => [decisionNode.nodeId, decisionNode] as const,
    ),
  ]);
  const visitingNodeIds = new Set<string>();
  const visitedNodeIds = new Set<string>();

  const getAdjacentNodeIds = (nodeId: string) => {
    const node = nodesById.get(nodeId);

    if (!node) {
      return [];
    }

    if ("nextNodeId" in node) {
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

  for (const nodeId of submittedNodeIds) {
    const cycleErrors = visit(nodeId);

    if (cycleErrors.length > 0) {
      errors.push(...cycleErrors);
      break;
    }
  }

  return errors;
};

export default getBuilderValidationErrors;
