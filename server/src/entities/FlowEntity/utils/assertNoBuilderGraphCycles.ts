import type {
  BuilderDecisionNodeInputType,
  BuilderStepInputType,
} from "@packages/shared/http/schemas/flows/builder/common";

import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

/**
 * Reject cyclic routing in the submitted builder graph before persistence so
 * preview/runtime can assume a DAG over direct flow-child navigation.
 */
export default function assertNoBuilderGraphCycles({
  decisionNodes,
  steps,
}: {
  decisionNodes: BuilderDecisionNodeInputType[];
  steps: BuilderStepInputType[];
}): void {
  const adjacencyByNodeId = new Map<string, string[]>();

  for (const step of steps) {
    adjacencyByNodeId.set(
      step.nodeId,
      step.nextNodeId === null ? [] : [step.nextNodeId],
    );
  }

  for (const decisionNode of decisionNodes) {
    adjacencyByNodeId.set(decisionNode.nodeId, [
      decisionNode.fallbackNextNodeId,
      ...decisionNode.conditions.map((condition) => condition.toNodeId),
    ]);
  }

  const visitingNodeIds = new Set<string>();
  const visitedNodeIds = new Set<string>();

  const visit = (nodeId: string): void => {
    if (visitingNodeIds.has(nodeId)) {
      throw new InvalidRequestError(
        `Builder graph contains a cycle involving node id: ${nodeId}.`,
      );
    }

    if (visitedNodeIds.has(nodeId)) {
      return;
    }

    visitingNodeIds.add(nodeId);

    for (const adjacentNodeId of adjacencyByNodeId.get(nodeId) ?? []) {
      visit(adjacentNodeId);
    }

    visitingNodeIds.delete(nodeId);
    visitedNodeIds.add(nodeId);
  };

  for (const nodeId of adjacencyByNodeId.keys()) {
    visit(nodeId);
  }
}
