import { NodeType } from "~shared/types/enums";

type GraphDecisionCondition = {
  id: string;
  order?: number;
  toNodeId: string | null;
};

type GraphDecisionNode = {
  conditions: GraphDecisionCondition[];
  fallbackNextNodeId: string | null;
  nodeId: string;
  type: NodeType.DECISION;
};

type GraphNode = GraphDecisionNode | GraphStepNode;

type GraphStepNode = {
  nextNodeId: string | null;
  nodeId: string;
  type: NodeType.STEP;
};

const sortDecisionConditions = (conditions: GraphDecisionCondition[]) => {
  return [...conditions].sort(
    (left, right) =>
      (left.order ?? Number.MAX_SAFE_INTEGER) -
        (right.order ?? Number.MAX_SAFE_INTEGER) ||
      left.id.localeCompare(right.id),
  );
};

const getNodeTargets = (node: GraphNode) => {
  if (node.type === NodeType.STEP) {
    return node.nextNodeId ? [node.nextNodeId] : [];
  }

  return [
    node.fallbackNextNodeId,
    ...sortDecisionConditions(node.conditions).map(
      (condition) => condition.toNodeId,
    ),
  ];
};

export const getOrderedStepNodeIds = (nodes: GraphNode[]) => {
  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));
  const inboundReferenceCounts = new Map(nodes.map((node) => [node.nodeId, 0]));
  const orderedStepNodeIds: string[] = [];
  const visitedNodeIds = new Set<string>();

  for (const node of nodes) {
    for (const targetNodeId of getNodeTargets(node)) {
      if (!targetNodeId || !inboundReferenceCounts.has(targetNodeId)) {
        continue;
      }

      inboundReferenceCounts.set(
        targetNodeId,
        (inboundReferenceCounts.get(targetNodeId) ?? 0) + 1,
      );
    }
  }

  const visitNode = (nodeId: string) => {
    if (visitedNodeIds.has(nodeId)) {
      return;
    }

    const node = nodeById.get(nodeId);

    if (!node) {
      return;
    }

    visitedNodeIds.add(nodeId);

    if (node.type === NodeType.STEP) {
      orderedStepNodeIds.push(node.nodeId);
    }

    for (const targetNodeId of getNodeTargets(node)) {
      if (targetNodeId) {
        visitNode(targetNodeId);
      }
    }
  };

  const rootNodeIds = [...inboundReferenceCounts.entries()]
    .filter(([, count]) => count === 0)
    .map(([nodeId]) => nodeId)
    .sort((left, right) => left.localeCompare(right));

  for (const rootNodeId of rootNodeIds) {
    visitNode(rootNodeId);
  }

  for (const nodeId of [...nodeById.keys()].sort((left, right) =>
    left.localeCompare(right),
  )) {
    visitNode(nodeId);
  }

  return orderedStepNodeIds;
};
